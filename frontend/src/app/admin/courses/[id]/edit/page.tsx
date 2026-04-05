import dynamic from 'next/dynamic';

const EditCourseClient = dynamic(() => import('./EditCourseClient'), { ssr: false });

export function generateStaticParams() {
  return [];
}

export default function EditCoursePage() {
  return <EditCourseClient />;
}
