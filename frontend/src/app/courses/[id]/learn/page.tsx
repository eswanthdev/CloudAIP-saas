import LearnClient from './LearnClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function LearnPage() {
  return <LearnClient />;
}
