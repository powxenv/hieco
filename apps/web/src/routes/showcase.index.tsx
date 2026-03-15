import { convexQuery } from "@convex-dev/react-query";
import { useWallet } from "@hieco/wallet-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";
import { Label } from "#/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "#/components/ui/popover";
import { Switch } from "#/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/ui/tooltip";
import {
  isPackageOption,
  isUseCaseOption,
  packageOptions,
  useCaseOptions,
} from "#/lib/showcase-options";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: z.string().catch("").default(""),
  packages: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      const values = typeof value === "string" ? [value] : (value ?? []);

      return values.filter(isPackageOption);
    }),
  useCases: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      const values = typeof value === "string" ? [value] : (value ?? []);

      return values.filter(isUseCaseOption);
    }),
  openSource: z.boolean().catch(false).default(false),
  hideYours: z.boolean().catch(false).default(false),
});

export const Route = createFileRoute("/showcase/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    openSource: search.openSource,
    packageNames: search.packages,
    q: search.q,
    useCases: search.useCases,
  }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.projects.listApproved, {
        q: deps.q,
        openSource: deps.openSource,
        packageNames: deps.packageNames,
        useCases: deps.useCases,
      }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useWallet();
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: approvedProjects } = useSuspenseQuery(
    convexQuery(api.projects.listApproved, {
      q: filters.q,
      openSource: filters.openSource,
      packageNames: filters.packages,
      useCases: filters.useCases,
    }),
  );
  const { data: yourProjects = [] } = useQuery({
    ...convexQuery(api.projects.listByOwner, {
      ownerAccountId: session?.accountId ?? "",
      q: filters.q,
      openSource: filters.openSource,
      packageNames: filters.packages,
      useCases: filters.useCases,
    }),
    enabled: session !== null && !filters.hideYours,
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
            Discover projects built on Hedera with the Hiero and Hieco ecosystem.
          </p>
          {session ? (
            <SubmitProject />
          ) : (
            <Tooltip>
              <TooltipTrigger render={<Button size="lg">Submit Yours</Button>} />
              <TooltipContent>
                <p>Connect first to submit your project</p>
              </TooltipContent>
            </Tooltip>
          )}
          <div className="flex gap-2 mt-4">
            <InputGroup className="max-w-xs">
              <InputGroupInput
                onChange={(event) => {
                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      q: event.target.value,
                    }),
                  });
                }}
                placeholder="Search..."
                value={filters.q}
              />
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
                </PopoverHeader>
                <div className="mt-2">
                  <FieldGroup>
                    {packageOptions.map((packageName) => (
                      <Field key={packageName} orientation="horizontal">
                        <Checkbox
                          checked={filters.packages.includes(packageName)}
                          id={`filter-package-${packageName}`}
                          onCheckedChange={(checked) => {
                            void navigate({
                              search: (previous) => ({
                                ...previous,
                                packages: checked
                                  ? [...previous.packages, packageName]
                                  : previous.packages.filter((value) => value !== packageName),
                              }),
                            });
                          }}
                        />
                        <Label htmlFor={`filter-package-${packageName}`}>{packageName}</Label>
                      </Field>
                    ))}
                  </FieldGroup>
                </div>
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
                </PopoverHeader>
                <div className="mt-2">
                  <FieldGroup>
                    {useCaseOptions.map((useCase) => (
                      <Field key={useCase} orientation="horizontal">
                        <Checkbox
                          checked={filters.useCases.includes(useCase)}
                          id={`filter-use-case-${useCase}`}
                          onCheckedChange={(checked) => {
                            void navigate({
                              search: (previous) => ({
                                ...previous,
                                useCases: checked
                                  ? [...previous.useCases, useCase]
                                  : previous.useCases.filter((value) => value !== useCase),
                              }),
                            });
                          }}
                        />
                        <Label htmlFor={`filter-use-case-${useCase}`}>{useCase}</Label>
                      </Field>
                    ))}
                  </FieldGroup>
                </div>
              </PopoverContent>
            </Popover>
            <Field className="w-fit" orientation="horizontal">
              <Switch
                checked={filters.openSource}
                id="filter-open-source"
                onCheckedChange={(checked) => {
                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      openSource: checked,
                    }),
                  });
                }}
              />
              <FieldLabel htmlFor="filter-open-source">Open Source</FieldLabel>
            </Field>
            {session && (
              <Field className="w-fit" orientation="horizontal">
                <Switch
                  checked={filters.hideYours}
                  id="filter-hide-yours"
                  onCheckedChange={(checked) => {
                    void navigate({
                      search: (previous) => ({
                        ...previous,
                        hideYours: checked,
                      }),
                    });
                  }}
                />
                <FieldLabel htmlFor="filter-hide-yours">Hide Yours</FieldLabel>
              </Field>
            )}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="inner space-y-4">
          {session && !filters.hideYours ? (
            <>
              <h2 className="text-2xl mb-4 font-semibold">Your Projects</h2>
              {yourProjects.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {yourProjects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <p>No projects match the current filters.</p>
              )}
            </>
          ) : null}

          <h2 className="text-2xl mb-4 font-semibold">All Projects</h2>
          {approvedProjects.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {approvedProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <p>No public projects match the current filters.</p>
          )}
        </div>
      </section>
    </>
  );
}

function ProjectCard({ project }: { project: Doc<"projects"> }) {
  return (
    <Link params={{ slug: project.slug }} to="/showcase/$slug">
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
          <h3 className="text-2xl font-bold wrap-break-words">{project.name}</h3>
          <p className="text-lg text-zinc-600 break-all line-clamp-2">{project.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {project.packageNames.map((packageName) => (
            <Badge key={packageName}>{packageName}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
