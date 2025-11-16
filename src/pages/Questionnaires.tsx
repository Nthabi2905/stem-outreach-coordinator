import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolNeedsQuestionnaire } from "@/components/SchoolNeedsQuestionnaire";
import { CompanyOffersQuestionnaire } from "@/components/CompanyOffersQuestionnaire";

const Questionnaires = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">STEM Partnership Questionnaires</h1>
          <p className="text-muted-foreground text-lg">
            Help us connect schools with STEM resources and opportunities
          </p>
        </div>

        <Tabs defaultValue="school" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="school">For Schools</TabsTrigger>
            <TabsTrigger value="company">For Companies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="school">
            <SchoolNeedsQuestionnaire />
          </TabsContent>
          
          <TabsContent value="company">
            <CompanyOffersQuestionnaire />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Questionnaires;