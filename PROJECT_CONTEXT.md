PROJECT_CONTEXT.md
1. Studio & Platform Blueprint
Studio Entity: 11th Floor Games (The overarching platform, hub, and brand).

Flagship Title: 11th Floor Questions (An elevator-themed, fast-paced trivia climbing game).

Future Scope: The platform architecture, authentication, and Vault subscription must support additional future game titles beyond 11th Floor Questions.

2. Strict Project Owner & Workflow Rules
Owner Profile: Non-technical studio owner.

Non-Destructive Workflow Constraint: Strict File-Replacement Workflow ONLY.

NEVER ask the project owner to hunt for specific lines of code, perform manual debugging, edit individual lines, or execute developer-style tasks.

ALWAYS provide complete, drop-in replacement files or structured, professional developer task specs.

NEVER generate speculative code from scratch when source files are missing—ask for the full source file or write a developer task ticket instead.

3. Game Mechanics & Flow (11th Floor Questions)
Structure: 10 questions (floors) per game entry.

Timer: 15-second strict countdown per question/floor.

Floor Label Naming Standard: Always format floor indicators as full text with padded double digits: Floor 01 through Floor 10, and Floor 11 (Victory state). Never use F01, F1, FL01, or raw numbers without "Floor ".

Progression State Logic:

Floor 01 through Floor 10 represent active questions.

Answering Question 10 correctly must increment the header/state to Floor 11 before opening the victory screen ("11th Floor Reached").

Failure State (Game Over Modal):

Triggered immediately upon an incorrect answer or timer expiration.

Displays three specific action choices:

Try Again (Primary Action): Instantly resets and reloads Floor 01 of the exact same game without navigating away or forcing the user back to the Vault/Lobby menu. Resets active streak.

View Stats (Secondary Action): Opens breakdown of attempt metrics.

Back to Vault (Tertiary Action): Returns player to the Vault archive list or main lobby.

4. Monetization & "The Vault" System
Daily Game Engine: One game entry released daily. Free to play for all users for 24 hours.

Vault Archiving: After 24 hours, the daily game automatically locks and migrates to "The Vault."

Subscription Model: Integrated via Stripe.

Free Tier: Daily game access only.

Subscriber Tier (Vault Access): Unlimited access to the entire historical archive (including the 50 finalized founding sets), streak repair capabilities, and exclusive monthly bonus packs.

Database State (Supabase): Tracks user play history, active streaks, longest streaks, Vault subscription status, and per-floor answer times.

5. Content Engine & Question Guidelines
Archive Scale: 50 curated 10-floor game sets (500 questions total) finalized for launch.

Content Bans (Strict Negative Constraints):

ABSOLUTELY NO: Architecture, typography, cartography, textiles, obscure theatre history, or generic Van Gogh / cliché fine art tropes.

Positive Question Standards:

Answer Integrity: Every question must have exactly one unambiguously correct, fact-checked answer.

Distractor Design: Wrong options must be plausible and well-crafted—never joke answers, obvious fillers, or grammatically mismatched options.

Pacing & Length: Questions and answers must be concise enough to be read, processed, and answered comfortably within the 15-second timer on a mobile screen.

Topic Variety: Each 10-floor run must offer a balanced mix of pop culture, history, science, geography, music, cinema, and general knowledge without repeating subjects within the same run.

6. Visual Theme & UI/UX Standards
Aesthetic Theme: Dark, high-contrast, modern elevator control panel styling.

Mobile Responsiveness Constraints:

Primary target viewports: 375px to 390px width (iPhone / Android standards).

Stats Graph Container: Must use width: 100%, box-sizing: border-box, and dedicated right-side padding (e.g., padding-right: 12px or 20px chart canvas offset) so right-edge data labels and numbers never clip off screen.

Touch Targets: All buttons (Try Again, answer choices, menu toggles) must meet minimum mobile touch standards with clear visual hover/active press states.

7. Technical Infrastructure
Frontend: Next.js (App Router, Tailwind CSS)

Backend / Database: Supabase (Auth, Postgres, Row-Level Security)

Payments: Stripe API (Checkout, Webhooks, Customer Portal)

Deployment Pipeline: GitHub repository connected to Vercel auto-deployments.
