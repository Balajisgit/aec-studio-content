---
title: How BuilderPluss Studio improves (for firms)
audience: firms
order: 2
about: For every firm on the Studio: how to ask for what you need, and how to make the Studio work your way.
---
# How BuilderPluss Studio improves, for your firm

BuilderPluss Studio gets better in two places: the **Studio itself**, which BuilderPluss builds for every firm, and **your
firm's own knowledge**, which you shape for your way of working. This guide says how to ask for changes, how to make your
own, and who in your firm does what.

## 1. Two ways to make the Studio better for you

| | The Studio itself | Your firm's own knowledge |
|---|---|---|
| **What** | What the Studio can do: its tools, pages, checks, the Library everyone shares, the pipelines everyone starts from | How *your* work is done: your pipelines, your agents' instructions, your standards (lessons), your Library Objects, your layout patterns, your scripts |
| **Who changes it** | BuilderPluss | Your firm's owner, admins and FDE |
| **How you take part** | *Request to BuilderPluss* | The Knowledge card, or ask Innowa in your firm's chat |
| **Who sees it** | Every firm | Only your firm |
| **How fast** | Planned and released by BuilderPluss | At once (or when your owner approves) |

**Which one do you need?**

- The Studio **can't do something** at all (a file format, a new kind of check, a connection to another program): ask BuilderPluss.
- The Studio **can do it, but not your way** (your room sizes, your order of steps, your drawing standards): change your firm's knowledge.
- Innowa or a pipeline **keeps getting the same thing wrong**: correct it. The Studio learns it as a lesson for your firm (see 4).

## 2. Who in your firm does what

| Role | Can |
|---|---|
| **Owner** | Everything in the firm: people and roles, workspaces, Claude limits, the firm's knowledge (at once), approving the FDE's proposals, offering knowledge to BuilderPluss, granting support access |
| **Admin** | The same, except billing and making another owner |
| **FDE** (an expert, often from BuilderPluss, with an end date) | Proposes changes to the firm's knowledge: pipelines, agents, scripts, standards. Your owner or an admin approves them, unless you let your FDE change them directly |
| **Member** | Works in the workspaces they are given; their corrections teach the firm's lessons; asks BuilderPluss through *Request to BuilderPluss* |
| **Guest** (a consultant, the client, a contractor) | One project only, as Editor, Reviewer or Viewer. A Reviewer views and answers decisions (sign-off) |

Project roles: **Lead** (everything on the project, and who has it), **Editor** (the model, files, pipelines), **Reviewer**
(views, comments, answers decisions), **Viewer** (views).

## 3. Asking BuilderPluss for something

**Where:** Studio page → **Requests to BuilderPluss**, or the **+ Request** button on any page, or tell Innowa in a chat
("ask BuilderPluss for …"). All three arrive at BuilderPluss as your firm's request, with your name.

**What makes a good request**

- One line saying what you want ("Export a project to IFC 4").
- Why: what goes wrong today, or what it would let you do ("our structural consultant needs IFC").
- An example: a project, a run, a screenshot.
- What *done* looks like.

**Following it:** the card lists your firm's requests and where each stands: *Open*, *Planned*, *Being built*, *Done*, or
*Declined* with the reason. Owners and admins see all of the firm's requests; members see their own. BuilderPluss's own
list stays private to BuilderPluss, as your firm's work stays private to you.

## 4. Making the Studio work your way

### 4.1 Lessons: just correct it

When Innowa or a pipeline's agent does something your way doesn't, correct it: change the model, undo its step, answer the
decision with a comment. The Studio reads your corrections and proposes lessons ("Walls are 230 mm"). Your owner or an admin
keeps the ones that are right (Pipelines page → *From your corrections*). From then on, inside your firm's work, every agent
keeps it in mind. If the same correction keeps coming up, the Studio suggests making it a rule.

Owners, admins and the FDE can also tell Innowa directly: "remember for the maker: our doors are 1000 mm wide."

### 4.2 Your own pipelines

A pipeline is a series of steps Innowa's agents work through, stopping where a person decides. Your firm can make its own,
from scratch, or start from one of BuilderPluss's and change it.

- **Ask Innowa** in your firm's chat: "make us a pipeline that reads a hotel brief, plans the room with our standard sizes,
  checks it, and asks the architect before keeping it." Innowa drafts the pipeline and its agents with you, shows them, and
  saves them when you agree. The Studio checks that it can run before keeping it.
- Or, for your FDE: Studio → **Knowledge** → open a path such as `pipelines/our-hotel-room/1.0.0.json`.

A pipeline's steps can read the brief and files, use the Library, make Objects, suggest placements, **change the model**
(each change one step anyone can undo), use your PCs' desktop apps, and run your firm's scripts. What it cannot do is use a
tool the Studio doesn't have: for that, ask BuilderPluss.

### 4.3 Your own Library Objects and patterns

- An Object made in a project can join **your firm's Library**: Library → *From your projects* → *Keep in your firm's Library* (owners, admins and the FDE).
- A room layout you like can be kept as a **pattern** on the canvas (owners, admins and the FDE); Innowa then starts from it.

### 4.4 Your own scripts, and your PCs' desktop apps

Some work needs a program: an area schedule from your files, an export, a check against your office standard. Your firm's
**scripts** do that.

- **Writing one:** ask Innowa, or your FDE adds it on the Knowledge card. A script comes with a short manifest: what it is for, which folders it needs (by name, like *projects*), whether it writes files, runs other programs or uses the internet.
- **Where it runs:** never on the Studio's server. It runs on a **PC of your firm's own people** whose Helper allows scripts, in a separate, limited process: it reads only the folders it names (as that PC maps them), writes only its output, is stopped at its time limit, and runs only if it is exactly the version your firm approved.
- **Desktop apps** (Blender, Revit and others with an MCP add-on) are reached the same way, through your PC's Helper.
- **Setting up a PC:** download the Helper (Studio → Helpers on PCs), start it, and list its apps and script folders in its `helper-tools.json`. The Studio can never add an app or a folder to your PC: only you can, on the PC.
- **Sharing a PC with the firm:** tick *the firm's runs may use it too* on the Helpers card (for example the office PC with Revit).

### 4.5 Who approves

| Change | Made by | Live |
|---|---|---|
| A lesson from corrections | The Studio proposes | When your owner or an admin keeps it |
| A pipeline, agent, check, script, Object, pattern | Owner or admin | At once |
| The same, by your FDE | FDE | When your owner or an admin approves it (or at once, if you allow your FDE to change it directly) |

Every change is listed with who and when (Knowledge card → *Changes*), and on the Organization card's *What changed*.

## 5. Offering your work to every firm

If your firm made something good (a pipeline, an Object, a script), you can offer it to BuilderPluss: Studio → Knowledge →
**Offer to BuilderPluss** beside the file. You give consent for it to become part of the Studio for every firm. BuilderPluss
reviews it, makes it general (no firm names or private standards), and tells you what happened on your *Requests to
BuilderPluss* card. Your own copy stays yours either way.

Nothing of your firm's leaves it any other way: your projects, chats, files, corrections and knowledge are never used for
other firms unless you offer them.

## 6. Keeping your firm safe and in control

- **People:** Studio → Organization: invite with a role and a workspace; change roles; take people out. Every 90 days, look down the *Access review* and mark it reviewed.
- **Guests:** a project's Lead invites them on the project's *People* card. Archiving the project ends their access.
- **Two-factor sign-in:** Studio → Your account → *Set up two-factor*. BuilderPluss may require it for owners and admins.
- **Claude use:** each person's Innowa runs on their own PC's Helper, with their own Claude account or key (billed to them by Anthropic). Studio → Organization → *Claude use this month* shows it by person, workspace and project; set monthly limits that warn or stop.
- **Support access:** when BuilderPluss must look inside to help, it asks you with a reason, for a few hours, read only. You grant or refuse it on the Organization card. In an emergency BuilderPluss may grant it itself; you see that until you mark it read.

## 7. Examples

**"We need IFC."** A member sends *Request to BuilderPluss*: "Export to IFC 4 for our consultants". BuilderPluss plans it;
the card shows *Planned*, then *Being built*, then *Done*.

**"Our hotel rooms."** Your FDE asks Innowa to draft *Our hotel room* with your standard sizes and a sign-off step. Your owner
approves it. Only your firm has it; your architects start it from any project.

**"Always 230 mm walls."** An architect corrects wall thickness a few times. The Studio proposes the lesson; your owner keeps
it. From then on every agent in your firm draws 230 mm walls.

**"The client signs off."** The Lead invites the client as a Reviewer. The pipeline stops at its decision; the client
approves in the Studio; the log keeps who approved, and when.
