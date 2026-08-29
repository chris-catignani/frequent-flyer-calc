'use client';

import posthog from 'posthog-js';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function getPostHogKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
}

function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const posthogKey = getPostHogKey();
    if (pathname && posthogKey) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    const posthogKey = getPostHogKey();
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || '/ingest';

    if (posthogKey && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        ui_host: 'https://us.posthog.com',
        capture_pageview: false, // Pageviews tracked manually with Next.js router
        capture_pageleave: true,
        person_profiles: 'identified_only',
      });
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
