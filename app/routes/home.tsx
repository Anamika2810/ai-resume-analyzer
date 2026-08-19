import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { resumes } from "../constants";
import ResumeCard from "~/constants/ResumeCard";
import { useNavigate } from "react-router";
import { useEffect } from "react";
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

export default function Home() {
    const { isLoading, puterReady, auth } = usePuterStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (puterReady && !isLoading && !auth.isAuthenticated) {
            navigate("/auth?next=/");
        }
    }, [puterReady, isLoading, auth.isAuthenticated, navigate]);

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

                {resumes.length > 0 && (
                    <div className="resumes-section">
                        {resumes.map((resume) => (
                            <ResumeCard
                                key={resume.id}
                                resume={resume}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}