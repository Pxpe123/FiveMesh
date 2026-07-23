import { useEffect, useState } from "react";

import { requestExamples, type ExampleModel } from "../../api/exampleApi";

const cache = new Map<string, ExampleModel[]>();
const pending = new Map<string, Promise<ExampleModel[]>>();
const cacheKey = "examples";

export function useExamples() {
  const [examples, setExamples] = useState<ExampleModel[]>(
    () => cache.get(cacheKey) ?? [],
  );
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const request = getExamples();

    if (!cache.has(cacheKey)) {
      setLoading(true);
    }

    request
      .then((items) => {
        if (active) {
          setExamples(items);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setError("Examples are not available right now.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { examples, loading, error };
}

function getExamples() {
  const cached = cache.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  const currentRequest = pending.get(cacheKey);
  if (currentRequest) {
    return currentRequest;
  }

  const request = requestExamples().then(
    (items) => {
      cache.set(cacheKey, items);
      pending.delete(cacheKey);
      return items;
    },
    (error) => {
      pending.delete(cacheKey);
      throw error;
    },
  );

  pending.set(cacheKey, request);
  return request;
}
