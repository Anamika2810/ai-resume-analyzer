import { Link } from "react-router";
import { useEffect, useState } from "react";
import ScoreCircle from './ScoreCircle';
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        let objectUrl = '';
        let cancelled = false;

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const loadImage = async () => {
            // Puter's API rate-limits concurrent requests, and every
            // ResumeCard on the dashboard fires one at mount — so a
            // transient 429 here is expected under load, not a real
            // failure. Retry a couple of times with backoff before
            // giving up quietly (the card just renders without its
            // preview image rather than throwing an unhandled rejection).
            const maxAttempts = 3;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const blob = await fs.read(imagePath);
                    if (!blob || cancelled) return;

                    objectUrl = URL.createObjectURL(blob);
                    setResumeUrl(objectUrl);
                    return;
                } catch (err) {
                    const isRateLimited =
                        err &&
                        typeof err === 'object' &&
                        'code' in err &&
                        (err as { code?: string }).code === 'too_many_requests';

                    if (isRateLimited && attempt < maxAttempts) {
                        await sleep(attempt * 500);
                        continue;
                    }

                    console.error('Failed to load resume preview image:', err);
                    return;
                }
            }
        };

        loadImage();

        // Release the object URL when the path changes or the card unmounts.
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imagePath, fs]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    <h2 className="!text-black font-bold break-words">{companyName}</h2>
                    <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {resumeUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                        />
                    </div>
                </div>
            )}
        </Link>
    );
};

export default ResumeCard;import { Link } from "react-router";
import { useEffect, useState } from "react";
import ScoreCircle from './ScoreCircle';
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        let objectUrl = '';
        let cancelled = false;

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const loadImage = async () => {
            // Puter's API rate-limits concurrent requests, and every
            // ResumeCard on the dashboard fires one at mount — so a
            // transient 429 here is expected under load, not a real
            // failure. Retry a couple of times with backoff before
            // giving up quietly (the card just renders without its
            // preview image rather than throwing an unhandled rejection).
            const maxAttempts = 3;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const blob = await fs.read(imagePath);
                    if (!blob || cancelled) return;

                    objectUrl = URL.createObjectURL(blob);
                    setResumeUrl(objectUrl);
                    return;
                } catch (err) {
                    const isRateLimited =
                        err &&
                        typeof err === 'object' &&
                        'code' in err &&
                        (err as { code?: string }).code === 'too_many_requests';

                    if (isRateLimited && attempt < maxAttempts) {
                        await sleep(attempt * 500);
                        continue;
                    }

                    console.error('Failed to load resume preview image:', err);
                    return;
                }
            }
        };

        loadImage();

        // Release the object URL when the path changes or the card unmounts.
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imagePath, fs]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    <h2 className="!text-black font-bold break-words">{companyName}</h2>
                    <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {resumeUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                        />
                    </div>
                </div>
            )}
        </Link>
    );
};

export default ResumeCard;