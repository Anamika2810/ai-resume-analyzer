import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

const ScoreBadge = ({ score }: { score: number }) => {
    const color =
        score > 69
            ? "text-green-600 bg-green-100"
            : score > 39
                ? "text-yellow-600 bg-yellow-100"
                : "text-red-600 bg-red-100";

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
            {score}/100
        </span>
    );
};

const FeedbackSection = ({
                             title,
                             score,
                             tips,
                         }: {
    title: string;
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation?: string }[];
}) => {
    if (!tips || tips.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <ScoreBadge score={score} />
            </div>

            <ul className="space-y-4">
                {tips.map((tip, index) => (
                    <li key={index} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span
                                className={
                                    tip.type === "good"
                                        ? "text-green-600 font-semibold"
                                        : "text-orange-600 font-semibold"
                                }
                            >
                                {tip.type === "good" ? "✓" : "!"}
                            </span>
                            <span className="font-medium">{tip.tip}</span>
                        </div>
                        {tip.explanation && (
                            <p className="text-gray-600 text-sm pl-6">
                                {tip.explanation}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Resume = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { kv } = usePuterStore();

    const [resume, setResume] = useState<Resume | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadResume = async () => {
            if (!id) {
                navigate("/upload");
                return;
            }

            try {
                setIsLoading(true);

                const data = await kv.get(`resume:${id}`);

                if (!data) {
                    console.error("Resume not found");
                    navigate("/upload");
                    return;
                }

                const parsedResume = JSON.parse(data) as Resume;

                setResume(parsedResume);
            } catch (error) {
                console.error("Failed to load resume:", error);
                navigate("/upload");
            } finally {
                setIsLoading(false);
            }
        };

        loadResume();
    }, [id, kv, navigate]);

    if (isLoading) {
        return (
            <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
                <Navbar />

                <section className="main-section">
                    <div className="page-heading">
                        <h1>Loading your resume analysis...</h1>
                    </div>
                </section>
            </main>
        );
    }

    if (!resume || !resume.feedback) {
        return null;
    }

    const { feedback } = resume;

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading">
                    <h1>Your Resume Analysis</h1>

                    <h2>
                        {resume.jobTitle} at {resume.companyName}
                    </h2>
                </div>

                <div className="flex flex-col gap-8 mt-8">
                    {/* Resume Preview */}
                    <div className="gradient-border">
                        <div className="w-full">
                            <img
                                src={resume.imagePath}
                                alt="Resume preview"
                                className="w-full max-h-[700px] object-contain object-top"
                            />
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div className="bg-white rounded-2xl p-8">
                        <h2 className="text-2xl font-bold">
                            Overall ATS Score
                        </h2>

                        <div className="mt-6 flex justify-center">
                            <div className="w-40">
                                <div className="relative">
                                    <svg
                                        className="w-40 h-40 transform -rotate-90"
                                        viewBox="0 0 100 100"
                                    >
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="10"
                                            fill="none"
                                            className="text-gray-200"
                                        />

                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="10"
                                            fill="none"
                                            strokeDasharray="251.2"
                                            strokeDashoffset={
                                                251.2 -
                                                (251.2 * feedback.overallScore) / 100
                                            }
                                            className="text-blue-500"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold">
                                            {feedback.overallScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ATS */}
                    <FeedbackSection
                        title="ATS Compatibility"
                        score={feedback.ATS.score}
                        tips={feedback.ATS.tips}
                    />

                    {/* Tone and Style */}
                    <FeedbackSection
                        title="Tone & Style"
                        score={feedback.toneAndStyle.score}
                        tips={feedback.toneAndStyle.tips}
                    />

                    {/* Content */}
                    <FeedbackSection
                        title="Content"
                        score={feedback.content.score}
                        tips={feedback.content.tips}
                    />

                    {/* Structure */}
                    <FeedbackSection
                        title="Structure"
                        score={feedback.structure.score}
                        tips={feedback.structure.tips}
                    />

                    {/* Skills */}
                    <FeedbackSection
                        title="Skills"
                        score={feedback.skills.score}
                        tips={feedback.skills.tips}
                    />
                </div>
            </section>
        </main>
    );
};

export default Resume;