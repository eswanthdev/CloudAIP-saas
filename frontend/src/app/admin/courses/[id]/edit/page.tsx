import EditCourseClient from './EditCourseClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function EditCoursePage() {
  return <EditCourseClient />;
}
