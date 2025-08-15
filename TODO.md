# TODO - Sinister Dexter Website

## Critical (Production Blockers)
- [x] **Set up production Tailwind CSS build** - ✅ DONE: Using Tailwind CLI to generate production CSS (25KB minified)
- [ ] **Fix hero text overlapping band members' faces** - Need to edit/crop the hero image file itself to provide more space for text placement
- [ ] **Fill in missing band member bios** - Jon Wagner, Patrick Neschleba, Lori Karns, David Mitby have empty or placeholder bios

## High Priority (User Experience)
- [ ] **Verify all band member data** - Confirm years with band, instruments, etc. are accurate
- [ ] **Add real press quotes** - Replace or verify the Mountain View Voice quote
- [ ] **Update venue list** - Verify which venues the band has actually played
- [ ] **Test music player on mobile** - Ensure touch controls and MediaSession API work properly
- [ ] **Add loading states** - Show loading indicators while images/audio load

## Medium Priority (Enhancements)
- [x] **Create videos.json** - ✅ DONE: YouTube videos now in data file
- [ ] **Add more photos to gallery** - Currently only 6 images
- [ ] **Implement image lazy loading** - Improve page load performance
- [ ] **Add Open Graph images** - Custom preview images for social media sharing
- [ ] **Create 404 page** - Custom error page
- [ ] **Add sitemap.xml generation** - Improve SEO
- [ ] **Implement search functionality** - Search shows, tracks, etc.

## Low Priority (Nice to Have)
- [ ] **Create MP3 validation system** - Check that all tracks exist in Cloudflare R2 bucket
- [ ] **Add show filtering** - Filter by date, venue, city
- [ ] **Add track filtering** - Filter by album, year
- [ ] **Implement dark/light mode toggle** - User preference for color scheme
- [ ] **Add animation effects** - Subtle animations for better UX
- [ ] **Create admin interface** - Web UI for updating JSON data files
- [ ] **Add RSS feed for shows** - Allow users to subscribe to show updates
- [ ] **Implement newsletter signup** - Integrate with email service
- [ ] **Add Instagram feed integration** - Pull latest posts from Instagram
- [ ] **Create EPK (Electronic Press Kit)** - Downloadable press materials

## Technical Debt
- [ ] **Add comprehensive test suite** - Unit tests for build system
- [ ] **Set up CI/CD pipeline** - Automated testing and deployment
- [ ] **Implement caching strategy** - CloudFlare cache rules
- [ ] **Add performance monitoring** - Track Core Web Vitals
- [ ] **Create development environment config** - Separate dev/staging/prod configs
- [ ] **Document API endpoints** - If/when we add dynamic features
- [ ] **Add TypeScript** - Type safety for build scripts
- [ ] **Implement CSP headers** - Content Security Policy for better security

## Content Updates (Ongoing)
- [ ] **Keep shows current** - Remove past shows, add new ones
- [ ] **Update band photos** - Fresh promotional photos
- [ ] **Add new tracks** - As they're recorded
- [ ] **Update member info** - As lineup changes

## Infrastructure
- [ ] **Set up staging environment** - Separate testing environment
- [ ] **Configure auto-deployment** - GitHub Actions to Cloudflare Pages
- [ ] **Set up monitoring/alerts** - Uptime monitoring, error tracking
- [ ] **Implement backup strategy** - Regular backups of data files
- [ ] **Add analytics** - Privacy-respecting analytics (not Google Analytics)

## Accessibility
- [ ] **Full accessibility audit** - WCAG 2.1 AA compliance
- [ ] **Keyboard navigation testing** - Ensure all interactive elements are keyboard accessible
- [ ] **Screen reader testing** - Test with NVDA/JAWS/VoiceOver
- [ ] **Add skip navigation links** - Already partially implemented, needs testing
- [ ] **Improve color contrast** - Some text may not meet WCAG standards

---
Last updated: 2024-01-15
Priority levels: Critical > High > Medium > Low