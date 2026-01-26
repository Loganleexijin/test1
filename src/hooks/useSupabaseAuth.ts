import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useFastingStore } from '@/store/fastingStore';

export const useSupabaseAuth = () => {
  const { setAuthToken, updateUserProfile, userProfile } = useFastingStore();

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data.session) {
        setAuthToken(data.session.access_token);
        const meta = data.session.user.user_metadata || {};
        const canUpdateNickname = !userProfile.nickname || userProfile.nickname === 'Flux 用户';
        if (canUpdateNickname && (meta.full_name || meta.name)) {
          updateUserProfile({ nickname: meta.full_name || meta.name });
        }
        if (meta.avatar_url) {
          updateUserProfile({ avatarDataUrl: meta.avatar_url });
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthToken(session.access_token);
        const meta = session.user.user_metadata || {};
        const canUpdateNickname = !userProfile.nickname || userProfile.nickname === 'Flux 用户';
        if (canUpdateNickname && (meta.full_name || meta.name)) {
          updateUserProfile({ nickname: meta.full_name || meta.name });
        }
        if (meta.avatar_url) {
          updateUserProfile({ avatarDataUrl: meta.avatar_url });
        }
      }
      if (event === 'SIGNED_OUT') {
        setAuthToken(null);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [setAuthToken, updateUserProfile, userProfile.nickname]);
};
