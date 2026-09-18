import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
    { title: "Resumer | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fs, kv } = usePuterStore();

    const [resume, setResume] = useState<Resume | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [resumeUrl, setResumeUrl] = useState<string>("");
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

                // The saved record only holds Puter filesystem paths, not
                // browser-loadable URLs — fetch the actual blobs and turn
                // them into object URLs the <img>/<a> tags can use.
                const [resumeBlob, imageBlob] = await Promise.all([
                    fs.read(parsedResume.resumePath),
                    fs.read(parsedResume.imagePath),
                ]);

                if (resumeBlob) {
                    setResumeUrl(
                        URL.createObjectURL(
                            new Blob([resumeBlob], { type: "application/pdf" })
                        )
                    );
                }

                if (imageBlob) {
                    setImageUrl(URL.createObjectURL(imageBlob));
                }
            } catch (error) {
                console.error("Failed to load resume:", error);
                navigate("/upload");
            } finally {
                setIsLoading(false);
            }
        };

        loadResume();
    }, [id, fs, kv, navigate]);

    // Object URLs aren't garbage-collected automatically — release them
    // when the component unmounts or a new resume is loaded.
    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
            if (resumeUrl) URL.revokeObjectURL(resumeUrl);
        };
    }, [imageUrl, resumeUrl]);

    if (isLoading) {
        return (
            <main className="!pt-0 min-h-screen flex items-center justify-center">
                <h1>Loading your resume analysis...</h1>
            </main>
        );
    }

    if (!resume || !resume.feedback || typeof resume.feedback === "string") {
        return null;
    }

    const { feedback } = resume;

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>

                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>

                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;