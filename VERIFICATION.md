# Verification — 28 October 2026

- Static frontend served successfully on 127.0.0.1:4173; no backend service.
- All HTML asset paths exist; no duplicate IDs. 20 WebP assets plus local fonts and two reference photos. Total web assets approximately 4.86 MB.
- JavaScript syntax check passed.
- Browser inspected at 1280px desktop, 521px preview pane, and real iframe viewports 390x680 and 320x640.
- Corrected envelope inner letter overflow at narrow widths; final cover inspected at both phone sizes.
- Independent flower/lantern rotations observed at two different times. Envelope opening and skip tested; page unlocked correctly.
- Desktop keepsake collage, hero, and mobile closing inspected.
- RSVP attendance/guest-count behavior and confirmation tested; declined attendance disables guest count.
- Wishes submitted and displayed safely as text. RSVP and wishes survive reload in browser-local demo storage.
- Photo lightbox opens and closes. Wedding gift expansion works.
- Keepsake PNG export reached success state and re-enabled download button.
- Google Calendar and Maps links preserve supplied event details. No event or message sent externally.
- No console errors or warnings observed during interaction tests.
- Reduced-motion CSS and JS fallback implemented; OS-level emulation was not performed.
- Request-song section absent, per user instruction.
- Test form data used localhost hostname, separate from the user's 127.0.0.1 preview storage.

Fonts: Pinyon Script (script headings), Cormorant Garamond (body and event text), Arial (small UI labels).

Latest revision: hero background verified as the cover satin asset. All six hanging images have a support wrapper, with four decorative rails and zero unattached lantern/knot images. Mobile hero visually inspected after revision; console clean.
