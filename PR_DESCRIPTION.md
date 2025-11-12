PR Title: feat: add Mama Girls Housing company page, wire route, and integrate company dropdown

PR Description:
Added a new company page for "MAMA GIRLS HOUSING AND REAL ESTATE AGENCY" and wired it into the site:
- Added page: `src/pages/companies/MamaGirlsHousing.jsx`
- Single-subsidiary list: `src/data/companies.js`
- Route added in `src/App.jsx` and Contact form updated to use the companies dropdown (`src/pages/Contact.jsx`)
- Verified production build and updated CI workflow

This change adds the subsidiary content and improves the contact flow so visitors can select the company when enquiring.
