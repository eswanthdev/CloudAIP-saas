import CourseDetailClient from './CourseDetailClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
