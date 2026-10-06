# Travelers’ Lab website

The website of the Travelers’ Lab at Wesleyan University: projects, lab notes, people, teaching and publications. All the content from the previous WordPress site has been carried over, and old links (including ones cited in papers) redirect to their new pages.

Everything on the site lives in this repository as ordinary files, so there is no database to maintain, and every change is saved in the history and can be undone.

## Updating the site

There are three ways. Use whichever suits the task.

### 1. The editor (no code)

Go to **`/keystatic`** on the site (for example `https://<site-address>/keystatic`), sign in with GitHub, and you'll see forms for **Blog posts, Projects, People and Pages**. Write or edit, add images, and press **Save**. The site updates itself within a minute or two.

You need a free GitHub account that has been given access to this repository.

### 2. Ask Claude

Open this folder in [Claude Code](https://claude.com/claude-code) (the terminal app, or the VS Code / desktop app) and describe what you want in plain English. Claude reads `CLAUDE.md`, which explains how the site is organised, so it knows where everything goes. For example:

- *“Write a new lab note from this text, by Diana Tran, linked to Comparing Chronicles. Here are two images.”*
- *“Move the Couriers of Aragon project to the archive.”*
- *“Add Tess Usher as a current student, class of 2027, working on Comparing Chronicles.”*
- *“Fix the typo in the C-DER summary.”*
- *“Show me the site locally so I can check before publishing.”*
- *“Publish these changes.”* (Claude commits and pushes, and the site redeploys.)

Claude will show you what it changed. Check the preview before asking it to publish.

### 3. Edit the files directly

Blog posts are in `content/posts/`, projects in `content/projects/`, people in `content/people/`, other pages in `content/pages/`. `CLAUDE.md` describes every field.

## Running it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000. The editor is at http://localhost:3000/keystatic, and saves straight to the files on your computer.

## Taking ownership (one-time setup)

The repository currently lives on Chukwudi Udechukwu's GitHub. To hand it over to the lab:

1. **Move the repository.** On GitHub: *Settings → General → Transfer ownership*, to the professor's account or a lab organisation. (Or create a new repo and push this code to it.) Decide whether it should be public or private.
2. **Deploy it.** Create a free [Vercel](https://vercel.com) account, choose *Add New → Project*, and import the repository. The defaults work. Every change pushed to `main` then publishes automatically.
3. **Turn on the editor's sign-in.** Follow *“Publishing without code”* at the end of `CLAUDE.md` (or ask Claude to walk you through it). This connects `/keystatic` to GitHub so edits made on the live site are saved.
4. **Give editors access.** Add each lab member who should edit the site as a collaborator on the repository (*Settings → Collaborators*).
5. **Use the real address and let search engines in.** Ask Wesleyan ITS to point `travelerslab.research.wesleyan.edu` (or a new address) at the Vercel project. Then, in Vercel → *Settings → Environment Variables*, add `NEXT_PUBLIC_SITE_URL` (the full address, e.g. `https://travelerslab.research.wesleyan.edu`) and `SITE_INDEXABLE` = `true`, and redeploy. Until then the site tells search engines not to list it.
6. **Register with Google.** Add the address in [Google Search Console](https://search.google.com/search-console) and submit `/sitemap.xml`. Search results improve over the following weeks; the lab's old links (DOIs, papers) already redirect to the new pages.

## Built with

Next.js, TypeScript, Tailwind CSS and Keystatic. Set in EB Garamond and Inter Tight.
