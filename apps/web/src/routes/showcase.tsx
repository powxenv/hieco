import { convexQuery } from "@convex-dev/react-query";
import { useWallet } from "@hieco/wallet-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import SolarBranchingPathsUpLineDuotone from "~icons/solar/branching-paths-up-line-duotone";
import SolarBoxLineDuotone from "~icons/solar/box-line-duotone";
import SolarMinimalisticMagniferLineDuotone from "~icons/solar/minimalistic-magnifer-line-duotone";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import heroImg from "../assets/hero.jpeg";
import SubmitProject from "#/components/submit-project";
import { Badge } from "#/components/ui/badge";
import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group";
import { Label } from "#/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Switch } from "#/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/showcase")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.projects.listApproved, {}),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useWallet();
  const { data: approvedProjects } = useSuspenseQuery(
    convexQuery(api.projects.listApproved, {}),
  );
  const { data: yourProjects = [] } = useQuery({
    ...convexQuery(api.projects.listByOwner, {
      ownerAccountId: session?.accountId ?? "",
    }),
    enabled: session !== null,
  });

  return (
    <>
      <div className="h-60 relative">
        <img
          alt="Showcase hero"
          className="absolute size-full object-cover object-top"
          src={heroImg}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white"></div>
      </div>
      <section className="relative">
        <div className="inner">
          <h1 className="text-6xl font-bold">Showcase</h1>
          <p className="text-xl max-w-md my-4">
            Discover projects built on Hedera with the Hiero and Hieco
            ecosystem.
          </p>
          {session ? (
            <SubmitProject />
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={<Button size="lg">Submit Yours</Button>}
              />
              <TooltipContent>
                <p>Connect first to submit your project</p>
              </TooltipContent>
            </Tooltip>
          )}
          <div className="flex gap-2 mt-4">
            <InputGroup className="max-w-xs">
              <InputGroupInput placeholder="Search..." />
              <InputGroupAddon>
                <SolarMinimalisticMagniferLineDuotone />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                {approvedProjects.length} results
              </InputGroupAddon>
            </InputGroup>
            <Popover>
              <PopoverTrigger
                render={
                  <Button className="w-fit" variant="outline">
                    <SolarBoxLineDuotone />
                    Filter Packages
                  </Button>
                }
              />
              <PopoverContent align="start">
                <PopoverHeader>
                  <PopoverTitle>Packages</PopoverTitle>
                  <PopoverDescription className="mt-2">
                    <FieldGroup>
                      <Field orientation="horizontal">
                        <Checkbox id="filter-package-hiero-sdk" />
                        <Label htmlFor="filter-package-hiero-sdk">
                          Hiero SDK
                        </Label>
                      </Field>
                    </FieldGroup>
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger
                render={
                  <Button className="w-fit" variant="outline">
                    <SolarBranchingPathsUpLineDuotone />
                    Filter Use Cases
                  </Button>
                }
              />
              <PopoverContent align="start">
                <PopoverHeader>
                  <PopoverTitle>Use Cases</PopoverTitle>
                  <PopoverDescription className="mt-2">
                    <FieldGroup>
                      <Field orientation="horizontal">
                        <Checkbox id="filter-use-case-defi" />
                        <Label htmlFor="filter-use-case-defi">DeFi</Label>
                      </Field>
                    </FieldGroup>
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            <Field className="w-fit" orientation="horizontal">
              <Switch id="filter-open-source" />
              <FieldLabel htmlFor="filter-open-source">Open Source</FieldLabel>
            </Field>
            {session && (
              <Field className="w-fit" orientation="horizontal">
                <Switch id="filter-hide-yours" />
                <FieldLabel htmlFor="filter-hide-yours">Hide Yours</FieldLabel>
              </Field>
            )}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="inner">
          {session ? (
            <>
              <h2 className="text-2xl mb-4 font-semibold">Your Projects</h2>
              {yourProjects.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {yourProjects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <p>No projects yet.</p>
              )}
            </>
          ) : null}

          <h2 className="text-2xl mb-4 font-semibold">All Approved Projects</h2>
          {approvedProjects.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {approvedProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <p>No approved projects yet.</p>
          )}
        </div>
      </section>
    </>
  );
}

function ProjectCard({ project }: { project: Doc<"projects"> }) {
  return (
    <a href={project.projectUrl} rel="noreferrer" target="_blank">
      <div className="aspect-video rounded-xl overflow-hidden">
        <img
          alt={`${project.name} screenshot`}
          className="object-cover size-full"
          src={project.screenshotUrl}
        />
      </div>
      <div className="-translate-y-8 px-4">
        <div className="bg-white border p-2 rounded-xl aspect-square size-14">
          {project.logoUrl ? (
            <img
              alt={`${project.name} logo`}
              className="size-full object-cover"
              src={project.logoUrl}
            />
          ) : null}
        </div>
        <div className="my-2">
          <h3 className="text-2xl font-bold wrap-break-words">
            {project.name}
          </h3>
          <p className="text-lg text-zinc-600 break-all line-clamp-2">
            {project.tagline}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {project.packageNames.map((packageName) => (
            <Badge key={packageName}>{packageName}</Badge>
          ))}
        </div>
      </div>
    </a>
  );
}
