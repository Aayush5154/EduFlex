# EduFlex Lite: Project Report

**Team:** Aayush
**Track / SDG:** SDG 4: Quality Education

---

## 1. Problem

*   **Who:** Students in regions with intermittent internet connectivity and self-directed learners who struggle with rigid curriculums.
*   **Where:** Remote areas or underserved communities where high-speed bandwidth is a luxury.
*   **How they cope today:** downloading videos illegally, using disconnected tools for notes (paper/external apps), or relying on physical textbooks.
*   **Why it’s hard:** Learning is fragmented. Students cannot easily organize their own resources, track progress offline, or access modern AI study aids without a stable connection.

## 2. How Our Understanding Changed

*   **Initial Thought:** We believed building a standard "Teacher posts, Student watches" platform was sufficient.
*   **What We Learned:** Students want agency. They don't just want to consume; they want to curate their own learning paths (playlists) and manage their own schedules.
*   **What Changed:**
    *   Shifted from "Teacher-only" content creation to allowing **Students to create Playlists**.
    *   Added **Todo/Task Management** so students can plan their study sessions.
    *   Prioritized **Offline Capabilities** (caching videos/notes) over fancy real-time streaming features.

## 3. Solution

*   **What We Built:** EduFlex Lite—an offline-first Learning Management System (LMS) with AI capabilities.
*   **Who Uses It:**
    *   **Teachers:** To structure comprehensive courses.
    *   **Students:** To learn, track progress, take notes, and curate their own resource lists.
*   **When They Use It:** primarily during study sessions (online) and reviewing materials/notes (offline).
*   **Why This Approach:** It bridges the digital divide. By enabling caching and student agency (Todos, Playlists), we empower learners to study on their own terms, regardless of connectivity.

## 4. What Works / What Doesn’t

### Working Features
*   **User Roles:** Secure authentication for Teachers and Students.
*   **Agency:** Students can now create and manage their own **Playlists** (previously restricted to teachers).
*   **Organization:** A fully functional **Todo/Task System** with priorities and due dates.
*   **Core Learning:** Video player with integrated **Note-taking** and sidebar navigation.
*   **Offline Mode:** Basic caching for playlists and notes works.

### Incomplete / Future Improvements
*   **Video Hosting:** Currently relies on external URLs; native video upload/compression is needed.
*   **Advanced AI:** The AI summarizer and chatbot are in early stages; accuracy can be improved.
*   **Success Metrics:** We will measure success by user retention rates and the number of "student-created playlists" vs. "teacher-created playlists."

## 5. Roadmap (Finals Plan)

We plan to implement the following before the final presentation:

*   **Gamification:** Add badging system for completing Todo items and Playlists.
*   **Peer Sharing:** Allow students to share their custom playlists with other students.
*   **Enhanced Analytics:** Visual graphs showing "Learning Velocity" based on completed videos over time.
*   **Native Video Uploads:** Integrate a cloud storage solution for direct video uploads.

## 6. AI Tools Used

*   **Google Gemini (Coding Assistant):** Used for rapid feature implementation (Todos, Student Playlists), debugging backend routes, and generating boilerplate code.
    *   *Assistance:* Writing complex Mongoose queries and React component logic.
    *   *My Decision:* System architecture, database schema design, and UI/UX flow.
*   **In-App AI (Simulated/Integrated):** Used for generating video summaries and quiz questions.
