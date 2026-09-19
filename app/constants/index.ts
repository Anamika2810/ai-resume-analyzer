export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                        AIResponseFormat,
                                    }: {
    jobTitle: string;
    jobDescription: string;
    AIResponseFormat: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
  Please analyze and rate this resume and suggest how to improve it.
  The rating can be low if the resume is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}

  Evaluate the resume against the following current, widely-followed ATS-friendly
  resume standard. Use this as the rubric for the "ATS" and "structure" scores
  in particular, and flag any deviation from it as an "improve" tip:

  LAYOUT RULES (judge from the resume image):
  - Single column only. Two-column layouts, sidebars, text boxes, or tables are a
    major red flag because they scramble the reading order for real ATS parsers.
  - No graphics: icons, photos, skill-rating bars, or charts should not be present.
  - Contact details (phone, email, LinkedIn, GitHub, city/state) must be in the
    body of the resume, not placed in a header or footer area, since some parsers
    skip those regions entirely.
  - Fonts should be standard and legible (e.g. Calibri, Arial, Times New Roman),
    roughly 10-12pt for body text and 14-16pt for the name.
  - Length: one page for freshers/entry-level candidates, at most two pages for
    experienced candidates.
  - Bullets should be simple round bullets; dates should use a standard format
    like "Jun 2025 - Aug 2025".

  SECTION ORDER AND HEADINGS (judge from the resume content):
  - Plain, conventional section headings are expected, in roughly this order:
    1. Name and contact info
    2. Summary (2-3 lines, optional) - target role plus top skills
    3. Education - degree, college/university, years, CGPA
    4. Skills - grouped, e.g. "Languages: ... | Frameworks: ... | Tools: ..."
    5. Projects - name, tech stack, and 2-3 impact bullets (especially important
       for freshers/students)
    6. Experience/Internships, if any
    7. Certifications and Achievements
  - Unconventional or overly creative headings that an ATS parser might not
    recognize should be flagged.

  CONTENT QUALITY:
  - Bullets should mirror the job description's exact keywords wherever they
    honestly apply (e.g. "REST APIs", "Spring Boot", "OOP").
  - Abbreviations should be spelled out at least once alongside the short form
    (e.g. "Object-Oriented Programming (OOP)") so both forms are matchable.
  - Bullets should start with action verbs and include measurable results
    (e.g. "Built a REST API handling 500+ requests/min using Spring Boot" is
    strong; "Worked on backend" is weak and should be called out).
  - Note whether the resume appears tailored to the specific job title/description
    provided, versus generic.

  Provide the feedback using the following format: ${AIResponseFormat}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments.`;