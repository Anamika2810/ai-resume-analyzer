import React, { useState, type FormEvent } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2image';
import { generateUUID } from '~/utils';
import {
    AIResponseFormat,
    prepareInstructions,
} from '~/constants';

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                 }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        try {
            setErrorText('');
            setIsProcessing(true);

            // 1. Upload resume
            setStatusText('Uploading the file...');

            const uploadFile = await fs.upload([file]);

            if (!uploadFile) {
                setErrorText('Error: No file uploaded.');
                return;
            }

            // 2. Convert PDF to image
            setStatusText('Converting to image...');

            const imageFile = await convertPdfToImage(file);

            if (!imageFile) {
                setErrorText('Error: Failed to convert PDF to image.');
                return;
            }

            if (!imageFile.file) {
                setErrorText(
                    imageFile.error
                        ? `Error: ${imageFile.error}`
                        : 'Error: Failed to generate image file.'
                );
                return;
            }

            // 3. Upload converted image
            setStatusText('Uploading the image...');

            const uploadImage = await fs.upload([imageFile.file]);

            if (!uploadImage) {
                setErrorText('Error: No image uploaded.');
                return;
            }

            // 4. Prepare resume data
            setStatusText('Preparing data...');

            const uuid = generateUUID();

            const data: Omit<Resume, 'feedback'> & { feedback: string | Feedback } = {
                id: uuid,
                resumePath: uploadFile.path,
                imagePath: uploadImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: '',
            };

            // 5. Store initial resume information (so a retry / refresh
            // has something to load even before analysis finishes)
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // 6. Analyze resume using AI
            setStatusText('Analyzing...');

            const feedback = await ai.feedback(
                uploadFile.path,
                prepareInstructions({
                    jobTitle,
                    jobDescription,
                    AIResponseFormat,
                })
            );

            if (!feedback) {
                setErrorText('Error: Failed to analyze resume.');
                return;
            }

            const feedbackText =
                typeof feedback.message.content === 'string'
                    ? feedback.message.content
                    : feedback.message.content[0]?.text ?? '';

            if (!feedbackText) {
                setErrorText('Error: No feedback received from AI.');
                return;
            }

            // The model is instructed to return raw JSON, but sometimes
            // wraps it in ```json fences or adds stray whitespace/text.
            // Strip that before parsing so we don't silently fail here.
            const cleanedFeedbackText = feedbackText
                .trim()
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/```$/i, '')
                .trim();

            let parsedFeedback;
            try {
                parsedFeedback = JSON.parse(cleanedFeedbackText);
            } catch (parseErr) {
                console.error(
                    'Failed to parse AI feedback JSON:',
                    parseErr,
                    cleanedFeedbackText
                );
                setErrorText(
                    'Error: AI returned an unexpected format. Please try again.'
                );
                return;
            }

            data.feedback = parsedFeedback;

            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analysis complete!');

            navigate(`/resume/${uuid}`);
        } catch (error) {
            console.error('Resume analysis error:', error);

            setErrorText(
                error instanceof Error
                    ? `Error: ${error.message}`
                    : 'Something went wrong while analyzing your resume.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!companyName || !jobTitle || !jobDescription) {
            alert('Please fill in all the fields.');
            return;
        }

        if (!file) {
            alert('Please upload your resume first.');
            return;
        }

        handleAnalyze({
            companyName,
            jobTitle,
            jobDescription,
            file,
        });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading">
                    <h1>Smart feedback for your dream job</h1>

                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>

                            <img
                                src="/images/resume-scan.gif"
                                className="w-full"
                                alt="Scanning resume"
                            />
                        </>
                    ) : errorText ? (
                        <h2 className="text-red-600">{errorText}</h2>
                    ) : (
                        <h2>
                            Drop your resume for an ATS score and
                            improvement tips
                        </h2>
                    )}
                </div>

                {!isProcessing && (
                    <form
                        id="upload-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 mt-8"
                    >
                        <div className="form-div">
                            <label htmlFor="company-name">
                                Company Name
                            </label>

                            <input
                                type="text"
                                name="company-name"
                                placeholder="Company Name"
                                id="company-name"
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>

                            <input
                                type="text"
                                name="job-title"
                                placeholder="Job Title"
                                id="job-title"
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="job-description">
                                Job Description
                            </label>

                            <textarea
                                rows={5}
                                name="job-description"
                                placeholder="Job Description"
                                id="job-description"
                            />
                        </div>

                        <div className="form-div">
                            <label htmlFor="uploader">Upload Resume</label>

                            <FileUploader onFileSelect={handleFileSelect} />
                        </div>

                        <button className="primary-button" type="submit">
                            Analyze Resume
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
};

export default Upload;