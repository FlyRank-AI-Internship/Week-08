const GEO_TIMEOUT_MS = 3000;

function normalizeIp(ip) {
  if (!ip) {
    return null;
  }

  // Express/Node can represent IPv4 as IPv6-mapped IPv4.
  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }

  return ip;
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    GEO_TIMEOUT_MS
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FlyRank-Widget-Capstone/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Geo provider returned HTTP ${response.status}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function lookupProviderA(ip) {
  if (
    process.env.GEO_PROVIDER_A_ENABLED !== "true"
  ) {
    throw new Error("Geo provider A disabled");
  }

  const data = await fetchWithTimeout(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city`
  );

  if (data.status !== "success") {
    throw new Error("Geo provider A lookup failed");
  }

  return {
    country: data.country ?? null,
    city: data.city ?? null,
    provider: "provider-a",
  };
}

async function lookupProviderB(ip) {
  if (
    process.env.GEO_PROVIDER_B_ENABLED !== "true"
  ) {
    throw new Error("Geo provider B disabled");
  }

  const data = await fetchWithTimeout(
    `https://ipapi.co/${encodeURIComponent(ip)}/json/`
  );

  if (data.error) {
    throw new Error(
      data.reason ?? "Geo provider B lookup failed"
    );
  }

  return {
    country:
      data.country_name ??
      data.country ??
      null,

    city: data.city ?? null,

    provider: "provider-b",
  };
}

export async function enrichIp(ipAddress) {
  const lookupIp =
    process.env.GEO_LOOKUP_IP_OVERRIDE?.trim() ||
    normalizeIp(ipAddress);

  if (!lookupIp) {
    console.warn(
      JSON.stringify({
        type: "geo_enrichment",
        status: "skipped",
        reason: "missing-ip",
      })
    );

    return {
      country: null,
      city: null,
      provider: null,
    };
  }

  try {
    const geo = await lookupProviderA(lookupIp);

    console.log(
      JSON.stringify({
        type: "geo_enrichment",
        status: "success",
        provider: geo.provider,
      })
    );

    return geo;
  } catch (errorA) {
    console.warn(
      `Geo provider A failed: ${errorA.message}`
    );
  }

  try {
    const geo = await lookupProviderB(lookupIp);

    console.log(
      JSON.stringify({
        type: "geo_enrichment",
        status: "success",
        provider: geo.provider,
      })
    );

    return geo;
  } catch (errorB) {
    console.warn(
      `Geo provider B failed: ${errorB.message}`
    );
  }

  // Critical rule:
  // Geo failure must never fail the submission.
  console.warn(
    JSON.stringify({
      type: "geo_enrichment",
      status: "degraded",
      provider: null,
    })
  );

  return {
    country: null,
    city: null,
    provider: null,
  };
}