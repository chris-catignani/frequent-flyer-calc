"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, Suspense } from "react";

function getPostHogKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
}

function PostHogPageViewTracker(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    const posthogKey = getPostHogKey();
    if (pathname && posthogKey) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    const posthogKey = getPostHogKey();
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/api/posthog";

    if (posthogKey && !(posthog as unknown as { __loaded: boolean }).__loaded) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        ui_host: "https://us.posthog.com",
        capture_pageview: false, // Pageviews tracked manually with Next.js router
        capture_pageleave: true,
        person_profiles: "identified_only",
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
