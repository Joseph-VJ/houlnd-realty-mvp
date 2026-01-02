**Customer (Buyer) account**

* The buyer dashboard loads with search filters and summary cards, but the **Logout** button is non‑functional; clicking it does nothing and manually visiting `/logout` returns a **404** page.
* The **Saved Properties** feature doesn’t persist; clicking the heart icon on property cards or in the property details page marks it as saved, but the “Saved properties” page always reports **“No saved properties yet”**.
* Unlocking seller contact details fails. When you click “View Seller Contact (FREE)”, an error appears: **“null value in column 'id' of relation 'unlocks' violates not‑null constraint”** and the phone number stays hidden.
* Appointment scheduling is not implemented; the “My Appointments” page always shows “No appointments yet”.
* Filtering by price/ city works and property cards display correct information, but there is no search by keywords.
* Navigation links sometimes misroute; there is no way to sign out other than clearing browser data.

**Promoter (Seller) account**

* The promoter dashboard shows 0 listings/earnings and provides links to **Post Property** and **Manage Listings**.
* Starting a new property listing is a multi‑step wizard (basic details, location, details, amenities, photos, availability, agreement, review). Steps 1‑4 work correctly; price per sq.ft is calculated automatically.
* Step 5 requires uploading at least 3 images. Uploading images from the local file system works, but when submitting the final listing, the site returns **“Submission Failed: Failed to upload image 1: Bucket not found”** after clicking **Submit Listing for Review**. The listing is not created.
* Because the listing cannot be submitted, the promoter cannot have any “Pending verification” or “Live listings” to manage. The “My Listings” page incorrectly shows existing listings (from other users) even when the promoter’s stats are zero.
* The promoter also cannot schedule availability (Step 6) – it’s labelled “Appointment scheduling coming soon”.
* Clicking the **Cancel** button in the listing wizard returns to the dashboard but doesn’t clear the partially entered data.

**Admin account**

* Logging in as admin via either buyer or seller login opens an **Admin Portal** with a dashboard summarizing platform metrics (platform users, active customers, promoters, total earnings, pending review, live listings, total unlocks). All metrics display **0** even though customer and promoter accounts exist.
* The **Pending** section opens `/admin/pending-listings` and shows “No pending listings” because the promoter listing couldn’t be submitted.
* **User management** (`/admin/users`) loads but the table is empty (total 0 users), even though there are three test accounts. This suggests the admin service is not fetching user data.
* Clicking the **Listings** tab logs the admin out and redirects back to the generic login page, suggesting a routing bug or missing route for `/admin/listings`.
* The **Logout** button in the admin navbar logs out correctly.

### Recommended code changes & bug fixes

| Area                         | Issue                                                                                                       | Suggested Fix                                                                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication & Routing** | • Logout button on buyer dashboard doesn’t work (no endpoint).  • Admin `Listings` tab logs the user out.   | Implement a functional `/logout` route that clears session/local‑storage and redirects to `/login`. Ensure admin routes (`/admin/listings`) exist and don’t trigger logout.            |
| **Property saving**          | Saved properties are not persisted; hearts turn red but the Saved page always shows zero.                   | Fix save/un-save logic: ensure clicking the heart triggers an API call to create/delete a “saved” record keyed by user and property; refresh local state after the API response.       |
| **Unlock contact details**   | Viewing seller contact throws a database error due to null `id` in `unlocks` table.                         | Ensure that unlocking contact inserts a valid record with non‑null IDs (user ID, property ID) before returning the phone number. Handle transactions and show success message.         |
| **Appointments**             | Appointment scheduling not implemented on buyer or promoter side.                                           | Hide or disable appointment sections until ready or implement basic scheduling (create appointment table, allow promoter to set slots and buyer to book).                              |
| **Posting listings**         | Submitting a property listing fails with **Bucket not found** during image upload.                          | Configure a valid storage bucket (e.g., AWS S3) and environment variables for image uploads. Validate image upload before final submission and return friendly errors if upload fails. |
| **Promoter listings page**   | “My Listings” shows global listings instead of only the promoter’s listings.                                | Filter listings by the logged‑in promoter’s ID when rendering the page.                                                                                                                |
| **Admin metrics**            | Dashboard always shows zero counts; user list is empty.                                                     | Update admin endpoints to fetch actual counts of users, promoters, buyers, properties, unlocks. Ensure the admin API returns data.                                                     |
| **General UX**               | Missing error handling leads to blank pages or silent failures (e.g., failing to save, failing to log out). | Add try/catch around API calls, display user‑friendly error messages, and keep the user on the same page.                                                                              |
| **Responsive design**        | Some pages require manual scroll; call‑to‑action buttons sometimes hidden below fold.                       | Add anchor links or auto‑scroll to next step; ensure forms auto‑scroll to top on validation errors.                                                                                    |

By addressing these bugs and improvements, the platform will support the full workflow for all three roles and provide a smoother user experience.
