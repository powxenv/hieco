import { convexQuery } from "@convex-dev/react-query";
import { useWallet } from "@hieco/wallet-react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import SolarHamburgerMenuLineDuotone from "~icons/solar/hamburger-menu-line-duotone";
import SolarLinkLineDuotone from "~icons/solar/link-line-duotone";
import SolarPenLineDuotone from "~icons/solar/pen-line-duotone";
import SolarTrashBinTrashLineDuotone from "~icons/solar/trash-bin-trash-line-duotone";
import SolarArrowRightUpLineDuotone from "~icons/solar/arrow-right-up-line-duotone";
import heroImg from "../assets/hero.jpeg";
import { api } from "../../convex/_generated/api";
import { Badge } from "#/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

export const Route = createFileRoute("/showcase/$slug")({
  params: {
    parse: (params) => ({
      slug: z.string().min(1).parse(params.slug),
    }),
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { session } = useWallet();
  const { data: project } = useQuery(
    convexQuery(
      api.projects.getBySlug,
      session ? { slug, ownerAccountId: session.accountId } : { slug },
    ),
  );

  if (project === undefined) {
    return null;
  }

  if (!project) {
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
            <p className="text-xl max-w-md my-4">Project not found.</p>
            <Button render={<Link to="/showcase" />} size="lg">
              Back to Showcase
            </Button>
          </div>
        </section>
      </>
    );
  }

  const isOwner = session?.accountId === project.ownerAccountId;

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
      <section className="py-10 -translate-y-22">
        <div className="inner grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden">
              <img
                alt={`${project.name} screenshot`}
                className="object-cover size-full"
                src={project.screenshotUrl}
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg">Libraries Used</h2>
              <div className="flex flex-wrap gap-2">
                {project.packageNames.map((packageName) => (
                  <Badge key={packageName}>{packageName}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg">Use Cases</h2>
              <div className="flex flex-wrap gap-2">
                {project.useCases.map((useCase) => (
                  <Badge key={useCase}>{useCase}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg">Project Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Project URL:</span>{" "}
                  <a href={project.projectUrl} rel="noreferrer" target="_blank">
                    {project.projectUrl}
                  </a>
                </p>
                {project.repositoryUrl ? (
                  <p>
                    <span className="font-semibold">Repository URL:</span>{" "}
                    <a
                      href={project.repositoryUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {project.repositoryUrl}
                    </a>
                  </p>
                ) : null}
                <p>
                  <span className="font-semibold">Owner Account:</span>{" "}
                  {project.ownerAccountId}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="bg-white border p-2 rounded-xl aspect-square size-20">
                {project.logoUrl ? (
                  <img
                    alt={`${project.name} logo`}
                    className="size-full object-cover"
                    src={project.logoUrl}
                  />
                ) : null}
              </div>
              {isOwner ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="secondary">
                        <SolarHamburgerMenuLineDuotone />
                        Actions
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <SolarPenLineDuotone />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <SolarTrashBinTrashLineDuotone />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>

            <div>
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <p className="text-zinc-500 break-all">{project.description}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              <Button
                render={
                  <a
                    href={project.projectUrl}
                    rel="noreferrer"
                    target="_blank"
                  />
                }
              >
                Visit Project
                <SolarArrowRightUpLineDuotone />
              </Button>
              {project.repositoryUrl ? (
                <Button
                  render={
                    <a
                      href={project.repositoryUrl}
                      rel="noreferrer"
                      target="_blank"
                    />
                  }
                  variant="outline"
                >
                  View Repository
                  <SolarArrowRightUpLineDuotone />
                </Button>
              ) : null}
            </div>

            <p className="text-lg break-all">{project.description}</p>
          </div>
        </div>
      </section>
    </>
  );
}
