import Hero from "@/components/Hero";
import SchoolFinder from "@/components/SchoolFinder";
import SchoolImporter from "@/components/SchoolImporter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <SchoolImporter />
        </div>
      </section>
      <SchoolFinder />
    </div>
  );
};

export default Index;
