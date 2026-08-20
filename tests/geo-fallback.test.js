import {
  afterEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import {
  enrichIp,
} from "../src/services/geoService.js";

afterEach(() => {
  vi.restoreAllMocks();

  process.env.GEO_PROVIDER_A_ENABLED =
    "true";

  process.env.GEO_PROVIDER_B_ENABLED =
    "true";

  delete process.env
    .GEO_LOOKUP_IP_OVERRIDE;
});

describe(
  "Geo fallback chain",
  () => {
    test(
      "provider A succeeds",
      async () => {
        process.env
          .GEO_PROVIDER_A_ENABLED =
          "true";

        global.fetch = vi
          .fn()
          .mockResolvedValue({
            ok: true,

            json: async () => ({
              status: "success",
              country:
                "United States",
              city: "Ashburn",
            }),
          });

        const result =
          await enrichIp(
            "8.8.8.8"
          );

        expect(
          result.provider
        ).toBe(
          "provider-a"
        );

        expect(
          result.country
        ).toBe(
          "United States"
        );
      }
    );

    test(
      "falls back to provider B",
      async () => {
        process.env
          .GEO_PROVIDER_A_ENABLED =
          "false";

        process.env
          .GEO_PROVIDER_B_ENABLED =
          "true";

        global.fetch = vi
          .fn()
          .mockResolvedValue({
            ok: true,

            json: async () => ({
              country_name:
                "United States",

              city:
                "Mountain View",
            }),
          });

        const result =
          await enrichIp(
            "8.8.8.8"
          );

        expect(
          result.provider
        ).toBe(
          "provider-b"
        );

        expect(
          result.city
        ).toBe(
          "Mountain View"
        );
      }
    );

    test(
      "both providers down degrades gracefully",
      async () => {
        process.env
          .GEO_PROVIDER_A_ENABLED =
          "false";

        process.env
          .GEO_PROVIDER_B_ENABLED =
          "false";

        const result =
          await enrichIp(
            "8.8.8.8"
          );

        expect(result).toEqual({
          country: null,
          city: null,
          provider: null,
        });
      }
    );
  }
);