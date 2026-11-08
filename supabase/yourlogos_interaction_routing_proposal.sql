-- CZ-103: review-only SQL proposal for the DEDICATED YourLogos Supabase project.
-- Do NOT apply to production without founder approval. Additive: no changes to current quotes/user data.
BEGIN;
CREATE TABLE IF NOT EXISTS public.quote_interaction_routes (
  quote_id integer PRIMARY KEY REFERENCES public.quotes(legacy_id) ON DELETE CASCADE,
  route_version integer NOT NULL DEFAULT 1 CHECK (route_version = 1),
  interaction_type text NOT NULL CHECK (interaction_type IN (
    'tradeoff_slider', 'decision_map', 'concept_builder', 'evidence_lens',
    'counterexample', 'perspective_switch', 'reflection_only')),
  intellectual_operation text NOT NULL CHECK (intellectual_operation IN (
    'allocate', 'choose_and_trace', 'construct_argument', 'weigh_evidence',
    'test_universal_claim', 'reinterpret', 'reflect')),
  rationale text NOT NULL CHECK (length(btrim(rationale)) BETWEEN 1 AND 900),
  proposal_source text NOT NULL DEFAULT 'editorial' CHECK (
    proposal_source IN ('founder_proposal','ai_proposal','editorial')),
  review_status text NOT NULL DEFAULT 'proposed' CHECK (
    review_status IN ('proposed','approved','rejected')),
  source_context_verified boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (
    jsonb_typeof(config) = 'object' AND octet_length(config::text) <= 12000),
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT route_approval_gate CHECK (
    review_status <> 'approved' OR
    (source_context_verified AND
      (interaction_type = 'reflection_only' OR config ? 'schemaVersion')))
);
-- Never grant public editorial write access.
ALTER TABLE public.quote_interaction_routes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quote_interaction_routes FROM anon, authenticated;
GRANT SELECT ON public.quote_interaction_routes TO anon, authenticated;
DROP POLICY IF EXISTS "reviewed routes for published quotes" ON public.quote_interaction_routes;
CREATE POLICY "reviewed routes for published quotes"
ON public.quote_interaction_routes FOR SELECT TO anon, authenticated
USING (
  review_status = 'approved' AND source_context_verified = true AND
  EXISTS (SELECT 1 FROM public.quotes q
    WHERE q.legacy_id = quote_id
      AND q.is_published = true AND q.review_status = 'verified')
);
CREATE INDEX IF NOT EXISTS quote_interaction_routes_review_idx
  ON public.quote_interaction_routes (review_status, interaction_type);

-- PROVISIONAL proposals; all have review_status='proposed' and are invisible to public clients.
-- quote_id 28 refers to Virginia Woolf's quote, not a GitHub issue number.
INSERT INTO public.quote_interaction_routes
(quote_id, interaction_type, intellectual_operation, rationale, proposal_source)
VALUES
(28, 'decision_map', 'choose_and_trace',
 'Woolf connects women''s ability to write with independent income and private space. A short choice map can explore how material circumstances constrain creative agency, without inventing an exclusive choice among income, time and privacy.',
 'founder_proposal'),
(49, 'tradeoff_slider', 'allocate',
 'Seneca raises the question of using finite time well. A connected allocation slider can represent a genuinely bounded day, with trade-offs made explicit rather than moralized.',
 'ai_proposal'),
(71, 'concept_builder', 'construct_argument',
 'Kant''s universalization test invites a single drag-to-connect relation between the chosen maxim and what would happen if that maxim were generally adopted. The philosophical context and wording require editorial review.',
 'ai_proposal'),
(21, 'perspective_switch', 'reinterpret',
 'Mill argues that understanding an argument requires exposure to serious objections. A brief claim/challenge/reply interaction can rehearse this idea without equating accusations with objections.',
 'ai_proposal'),
(10, 'counterexample', 'test_universal_claim',
 'A sweeping aphorism can be pressed with one independent example. A visual claim-breaker lets users distinguish literal universality from the broader philosophical insight.',
 'ai_proposal'),
(56, 'evidence_lens', 'weigh_evidence',
 'Hume connects degree of belief to evidential support; selecting among a repost, dated photo, and verified current test can expose why sources differ in reliability. Any meter is illustrative, never a numerical probability.',
 'ai_proposal')
ON CONFLICT (quote_id) DO NOTHING;
COMMIT;

-- After authorized application, verify count/status and public RLS.
-- SELECT quote_id, interaction_type, review_status FROM public.quote_interaction_routes;
-- Pending/proposed routes must NOT be visible to anon/authenticated.
-- Rollback: archive editorial proposals if any, then DROP TABLE public.quote_interaction_routes;
-- No other tables are modified by this proposal.