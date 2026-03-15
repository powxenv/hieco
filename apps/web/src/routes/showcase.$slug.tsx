import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useWallet } from "@hieco/wallet-react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";
import { z } from "zod";
import SolarHamburgerMenuLineDuotone from "~icons/solar/hamburger-menu-line-duotone";
import SolarTrashBinTrashLineDuotone from "~icons/solar/trash-bin-trash-line-duotone";
import SolarPenLineDuotone from "~icons/solar/pen-line-duotone";
import SolarArrowRightUpLineDuotone from "~icons/solar/arrow-right-up-line-duotone";
import heroImg from "../assets/hero.jpeg";
import { api } from "../../convex/_generated/api";
import EditProject from "#/components/edit-project";
import { Badge } from "#/components/ui/badge";
import { Button } from "@/components/ui/button";
import { env } from "#/env";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
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
  const navigate = Route.useNavigate();
  const { session } = useWallet();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const requestChallenge = useMutation(api.walletChallenges.requestChallenge);
  const deleteProject = useAction(api.projectsSubmit.deleteProject);
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

  const handleDeleteProject = async () => {
    if (!session) {
      toast.error("Connect your wallet before deleting a project.");
      return;
    }

    if (session.chain.network !== env.VITE_HEDERA_NETWORK) {
      toast.error(`Connect a ${env.VITE_HEDERA_NETWORK} wallet before deleting a project.`);
      return;
    }

    setIsDeleting(true);

    try {
      const challenge = await requestChallenge({
        accountId: session.accountId,
        action: "delete_project",
        domain: window.location.host,
      });
      const signatureMap = await session.signer.signMessage(challenge.message);

      await deleteProject({
        challengeId: challenge.challengeId,
        accountId: session.accountId,
        projectId: project._id,
        signatureMap,
      });

      setIsDeleteDialogOpen(false);
      toast.success("Project deleted.");
      await navigate({ to: "/showcase" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete the project.");
    } finally {
      setIsDeleting(false);
    }
  };

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
                    <a href={project.repositoryUrl} rel="noreferrer" target="_blank">
                      {project.repositoryUrl}
                    </a>
                  </p>
                ) : null}
                <p>
                  <span className="font-semibold">Owner Account:</span> {project.ownerAccountId}
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
                    <DropdownMenuItem
                      onClick={() => {
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <SolarPenLineDuotone />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsDeleteDialogOpen(true);
                      }}
                      variant="destructive"
                    >
                      <SolarTrashBinTrashLineDuotone />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>

            <div>
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <p className="text-zinc-500 break-all">{project.tagline}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              <Button render={<a href={project.projectUrl} rel="noreferrer" target="_blank" />}>
                Visit Project
                <SolarArrowRightUpLineDuotone />
              </Button>
              {project.repositoryUrl ? (
                <Button
                  render={<a href={project.repositoryUrl} rel="noreferrer" target="_blank" />}
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
      <EditProject onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen} project={project} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is sensitive. You will need to confirm here and sign a wallet challenge
              before the project is permanently removed from the showcase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={async () => {
                await handleDeleteProject();
              }}
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
