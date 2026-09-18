import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/constants/ResumeCard";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Resumer" },
        {
            name: "description",
            content: "Your Resume. Your Next Opportunity!",
        },
    ];
}

// A record only counts as a finished, displayable resume once its
// AI feedback has actually landed (it starts out as an empty string
// while analysis is still in progress).
function hasFeedback(resume: Resume): resume is Resume & { feedback: Feedback } {
    return !!resume.feedback && typeof resume.feedback !== "string";
}

export default function Home() {
    const { isLoading, puterReady, auth, kv } = usePuterStore();
    const navigate = useNavigate();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(true);

    useEffect(() => {
        if (puterReady && !isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/");
        }
    }, [puterReady, isLoading, auth.isAuthenticated, navigate]);

    useEffect(() => {
        const loadResumes = async () => {
            if (!puterReady || !auth.isAuthenticated) return;

            setLoadingResumes(true);

            try {
                const items = await kv.list("resume:*", true);

                const parsed = (items ?? [])
                    .map((item) => {
                        try {
                            const raw = typeof item === "string" ? item : item.value;
                            return JSON.parse(raw) as Resume;
                        } catch (err) {
                            console.error("Failed to parse resume entry:", err);
                            return null;
                        }
                    })
                    .filter((resume): resume is Resume => resume !== null)
                    .filter(hasFeedback);

                setResumes(parsed);
            } catch (err) {
                console.error("Failed to load resumes:", err);
            } finally {
                setLoadingResumes(false);
            }
        };

        loadResumes();
    }, [puterReady, auth.isAuthenticated, kv]);

    return (
        <main
            className="bg-cover"
            style={{ backgroundImage: "url('/images/bg-main.svg')" }}
        >
            <Navbar />

            <section className="main-section">
                <div className="page-heading">
                    <h1>Track Your Applications & Resume Ratings</h1>
                    <h2>
                        Review your submissions and check AI-powered feedback.
                    </h2>
                </div>

                {loadingResumes ? (
                    <h2>Loading your resumes...</h2>
                ) : resumes.length > 0 ? (
                    <div className="resumes-section">
                        {resumes.map((resume) => (
                            <ResumeCard
                                key={resume.id}
                                resume={resume}
                            />
                        ))}
                    </div>
                ) : (
                    <h2>No resumes analyzed yet — upload one to get started!</h2>
                )}
            </section>
        </main>
    );
}