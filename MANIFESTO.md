# Base Resolver Service Manifesto

## Operational Principles
1. **Deterministic Processing:** This gateway rejects transactional injection layers, speculative paths, or probabilistic gas estimation. It operates strictly as a predictable, immutable signal lookup.
2. **Data Integrity:** Every dataset returned maps directly to a verified, signed block hash extracted onchain from the active Base network.
3. **Token Efficiency:** Payload responses prioritize scannability and structural density, removing verbal filler to minimize downstream processing costs for consuming orchestrators.
