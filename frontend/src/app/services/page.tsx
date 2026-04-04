'use client';

import React from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ServiceCard from '@/components/services/ServiceCard';
import LeadForm from '@/components/services/LeadForm';
import { SERVICES } from '@/lib/constants';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-max">
          <h1 className="text-5xl font-bold mb-4">FinOps Services</h1>
          <p className="text-xl text-primary-100 max-w-2xl">
            Expert consulting and implementation services to optimize your cloud costs and establish FinOps practices
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-secondary-900 mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                features={service.features}
                cta="Request Consultation"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-16 bg-secondary-50">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-secondary-900 mb-12 text-center">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Assessment', desc: 'Evaluate current cloud spend and practices' },
              { step: '2', title: 'Strategy', desc: 'Develop customized optimization roadmap' },
              { step: '3', title: 'Implementation', desc: 'Execute cost reduction initiatives' },
              { step: '4', title: 'Optimization', desc: 'Continuous monitoring and improvement' },
            ].map((item) => (
              <Card key={item.step} className="text-center p-6">
                <div className="text-4xl font-bold text-primary-600 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{item.title}</h3>
                <p className="text-sm text-secondary-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section className="py-16 bg-white">
        <div className="container-max max-w-2xl mx-auto">
          <LeadForm
            title="Get Your Free Cloud Audit"
            onSubmit={(data) => {
              console.log('Lead submission:', data);
            }}
          />
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 bg-secondary-50">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-secondary-900 mb-12 text-center">Results We Deliver</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { company: 'TechCorp', saving: '$2.1M', time: '6 months', desc: 'Cloud cost reduction through Reserved Instances' },
              { company: 'StartupXYZ', saving: '$850K', time: '4 months', desc: 'Resource optimization and rightsizing' },
              { company: 'GlobalInc', saving: '$3.5M', time: '8 months', desc: 'Multi-cloud optimization strategy' },
            ].map((study, idx) => (
              <Card key={idx} className="p-6 bg-white">
                <h3 className="text-lg font-bold text-secondary-900 mb-2">{study.company}</h3>
                <p className="text-3xl font-bold text-primary-600 mb-2">{study.saving}</p>
                <p className="text-sm text-secondary-600 mb-4">Saved in {study.time}</p>
                <p className="text-sm text-secondary-700">{study.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Cloud Costs?</h2>
          <p className="text-lg text-primary-100 mb-8">
            Schedule a consultation with our FinOps experts today
          </p>
          <Button
            variant="primary"
            size="lg"
            className="bg-white text-primary-600 hover:bg-secondary-50"
          >
            Schedule Consultation
          </Button>
        </div>
      </section>
    </div>
  );
}
