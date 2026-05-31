---
name: Good first issue
about: A great task for first-time contributors to Shiori
labels: good first issue
assignees: ''
---

**What needs to be done**
<!-- Clear description of the task -->

**Files to look at**
- `client/src/pages/...`
- `client/src/components/...`

**Design tokens** (from `client/src/utils/theme.js`)
- Background: `#10141a`
- Card: `#161b24`
- Blue: `#afc6ff` / `#528dff`
- Use inline styles (not Tailwind classes)

**How to test**
1. Run `cd client && npm run dev`
2. Click "Try Demo" on the landing page
3. Navigate to the relevant page
4. Verify the change works

**Acceptance criteria**
- [ ] Works in demo mode (no Supabase required)
- [ ] Matches existing dark theme design
- [ ] No console errors
