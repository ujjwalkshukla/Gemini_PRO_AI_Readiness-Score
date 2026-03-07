export const APP_NAME = "AI Readiness Score";

export const SCORE_BANDS = {
  HIGH: { min: 80, label: "AI Ready", color: "text-emerald-600", bg: "bg-emerald-50" },
  MEDIUM: { min: 50, label: "Developing", color: "text-amber-600", bg: "bg-amber-50" },
  LOW: { min: 0, label: "Needs Preparation", color: "text-red-600", bg: "bg-red-50" },
};

export const SAMPLE_RESUME_TEXT = `John Doe
Software Engineer
San Francisco, CA

Summary
Experienced software engineer with a focus on backend systems and cloud infrastructure. Passionate about automating workflows and improving system reliability.

Experience
Senior Backend Engineer | TechCorp | 2019 - Present
- Designed and implemented microservices using Go and gRPC, reducing latency by 40%.
- Led the migration of legacy monolith to AWS, utilizing Docker and Kubernetes.
- Mentored junior engineers on best practices for CI/CD pipelines.

Software Engineer | StartupInc | 2016 - 2019
- Developed RESTful APIs using Python and Django.
- Integrated third-party APIs for payment processing and user authentication.
- Optimized database queries, improving reporting dashboard performance by 3x.

Skills
- Languages: Python, Go, JavaScript, SQL
- Tools: Docker, Kubernetes, AWS, Jenkins, Git
- Concepts: Microservices, REST, CI/CD, Agile
`;
