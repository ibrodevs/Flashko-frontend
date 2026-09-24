'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { sets as setsApi } from '@/lib/sets';
import { Button, Input, Textarea, ErrorMessage, Loading } from '@/components';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { ApiError } from '@/lib/api';

interface EditableCard {
  id?: number;
  term: string;
  definition: string;
}

export default function EditSetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const setId = resolvedParams.id;

  const { user, initialized } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<EditableCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    async function loadSet() {
      if (!user) return;
      setError('');
      try {
        const data = await setsApi.getById(setId);
        setTitle(data.title);
        setDescription(data.description || '');
        setCards(data.cards.map((c) => ({ id: c.id, term: c.term, definition: c.definition })));
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 404) {
          setError('Set not found.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load set.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (user && setId) {
      loadSet();
    }
  }, [user, setId]);

  const handleCardChange = (index: number, field: 'term' | 'definition', value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const handleAddCard = () => {
    setCards([...cards, { term: '', definition: '' }]);
  };

  const handleDeleteCard = (index: number) => {
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    // Check that all cards have non-empty term and definition
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].term.trim() || !cards[i].definition.trim()) {
        setError(`Card #${i + 1} has an empty term or definition.`);
        return;
      }
    }

    setSaving(true);
    try {
      await setsApi.update(setId, {
        title: title.trim(),
        description: description.trim(),
        cards: cards.map((c) => ({
          id: c.id,
          term: c.term.trim(),
          definition: c.definition.trim(),
        })),
      });
      router.push(`/sets/${setId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!initialized || loading) {
    return <Loading fullPage text="Loading set for editing..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/sets/${setId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Set
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--ink)] tracking-tight">
            Edit Set
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Update set title, description, or modify flashcards
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Set Info Card */}
        <div className="card card-pad space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            required
          />

          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
        </div>

        {/* Flashcards Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <h2 className="text-[20px] font-bold text-[var(--ink)]">
              Cards ({cards.length})
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddCard}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Card
            </Button>
          </div>

          {cards.length === 0 ? (
            <div className="card card-pad text-center py-8 text-[var(--muted)] border-dashed border-2">
              No cards in this set yet. Click &ldquo;Add Card&rdquo; above.
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card, idx) => (
                <div
                  key={card.id ? `card-${card.id}` : `new-${idx}`}
                  className="card card-pad flex flex-col md:flex-row gap-4 items-start relative group"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] text-[var(--muted)] text-xs font-semibold flex items-center justify-center border border-[var(--line)] shrink-0 mt-1">
                    {idx + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                    <Input
                      label="Term"
                      value={card.term}
                      onChange={(e) => handleCardChange(idx, 'term', e.target.value)}
                      placeholder="e.g. pwd"
                      disabled={saving}
                      required
                    />

                    <Textarea
                      label="Definition"
                      rows={2}
                      value={card.definition}
                      onChange={(e) => handleCardChange(idx, 'definition', e.target.value)}
                      placeholder="e.g. Prints current working directory"
                      disabled={saving}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCard(idx)}
                    aria-label="Remove card"
                    className="self-end md:self-center w-9 h-9 rounded-[9px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red-strong)] hover:bg-[var(--red-bg)] transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleAddCard}
              icon={<Plus className="w-4 h-4" />}
            >
              + Add Another Card
            </Button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--line)]">
          <Link href={`/sets/${setId}`}>
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
