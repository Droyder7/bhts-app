import type { JSX } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type FiltersSectionProps = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  languages: string[];
  selectedLanguages: string[];
  toggleLanguage: (language: string) => void;

  experienceOptions: { id: string; value: string; label: string }[];
  selectedExperiences: string[]; // can be one or many, we handle both
  toggleExperience: (exp: string) => void;

  applyFilters: () => void;
};

export const FiltersSection = ({
  searchQuery,
  setSearchQuery,
  languages,
  selectedLanguages,
  toggleLanguage,
  experienceOptions,
  selectedExperiences,
  toggleExperience,
  applyFilters,
}: FiltersSectionProps): JSX.Element => {
  return (
    <div className="flex w-full flex-col items-start gap-6 overflow-hidden rounded-[20px] border border-[#0000001a] border-solid px-6 py-5 md:w-full lg:w-auto lg:max-w-xs">
      <div className="flex w-full items-center justify-between self-stretch">
        <h2 className="w-fit font-bold text-black text-xl leading-[normal]">
          Filters
        </h2>

        {/* Reset button */}
        <img
          width={24}
          height={24}
          className="cursor-pointer"
          alt="Reset filters"
          src="https://c.animaapp.com/mcknz73dMW2Mce/img/frame.svg"
        />
      </div>

      <Separator className="h-px w-full self-stretch" />

      <div className="flex w-full flex-col items-start gap-5">
        <Accordion type="multiple" className="flex w-full flex-col gap-5">
          {/* Language Filter */}
          <AccordionItem
            value="language"
            className="flex flex-col gap-5 border-none"
          >
            <AccordionTrigger className="p-0 hover:no-underline">
              <div className="font-bold text-black text-xl">Language</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-5">
                {/* Search inside language */}
                <div className="border-[#00000066] border-b py-2">
                  <div className="flex items-center gap-2">
                    <img
                      width={12}
                      height={12}
                      alt="Search icon"
                      src="https://c.animaapp.com/mcknz73dMW2Mce/img/vector.svg"
                    />
                    <Input
                      className="h-auto border-none p-0 text-[#00000066] text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {languages
                  .filter((lang) =>
                    lang.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((lang) => (
                    <div key={lang} className="flex items-center gap-2">
                      <Checkbox
                        id={lang}
                        checked={selectedLanguages.includes(lang)}
                        onCheckedChange={() => toggleLanguage(lang)}
                        className={cn(
                          "h-4 w-4 rounded-sm border border-[#016d68]",
                          selectedLanguages.includes(lang) && "bg-[#016d68]",
                        )}
                      />
                      <label
                        htmlFor={lang}
                        className="cursor-pointer text-[#00000099] text-base"
                      >
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </label>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Experience Filter */}
          <AccordionItem
            value="experience"
            className="flex flex-col gap-5 border-none"
          >
            <AccordionTrigger className="p-0 hover:no-underline">
              <div className="font-bold text-black text-xl">Experience</div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-5">
                {experienceOptions.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedExperiences.includes(option.value)}
                      onCheckedChange={() => toggleExperience(option.value)}
                      className="h-4 w-4 rounded-sm border border-[#016d68]"
                    />
                    <label
                      htmlFor={option.id}
                      className="cursor-pointer text-[#00000099] text-base"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          variant="default"
          className="w-full bg-[#016E69] text-white"
          onClick={applyFilters}
        >
          Apply Filter
        </Button>
      </div>
    </div>
  );
};
