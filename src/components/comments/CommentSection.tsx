import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Comment } from '../../types';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useAuth } from '../../providers/AuthProvider';

interface CommentSectionProps {
  photoId: string;
  canComment: boolean;
}

interface CommentForm {
  content: string;
}

const fetchComments = async (photoId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles(username)')
    .eq('photo_id', photoId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as Comment[];
};

export const CommentSection = ({ photoId, canComment }: CommentSectionProps) => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const form = useForm<CommentForm>({ defaultValues: { content: '' } });

  const { data: comments, isLoading, isError, error } = useQuery({
    queryKey: ['comments', photoId],
    queryFn: () => fetchComments(photoId)
  });

  const mutation = useMutation({
    mutationFn: async (payload: CommentForm) => {
      if (!profile) throw new Error('Je moet ingelogd zijn om te reageren.');
      const { error: insertError } = await supabase.from('comments').insert({
        photo_id: photoId,
        content: payload.content.trim()
      });
      if (insertError) {
        throw insertError;
      }
    },
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['comments', photoId] });
    }
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!values.content.trim()) return;
    await mutation.mutateAsync(values);
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
        Reacties
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}
        {isError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            Kon reacties niet laden: {error instanceof Error ? error.message : 'Onbekende fout'}
          </div>
        )}
        {comments && comments.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500">Nog geen reacties. Wees de eerste!</p>
        )}
        {comments &&
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs font-semibold text-slate-500">{comment.author?.username ?? 'Onbekend'}</p>
              <p className="text-sm text-slate-700">{comment.content}</p>
            </div>
          ))}
      </div>
      {canComment ? (
        <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Textarea
            rows={3}
            placeholder="Laat een reactie achter"
            {...form.register('content', { required: true })}
            className="mb-3"
          />
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Plaatsen
          </Button>
        </form>
      ) : (
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-500">
          Log in of registreer om te reageren.
        </div>
      )}
    </div>
  );
};
