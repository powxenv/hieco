import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet } from "@hieco/wallet-react";
import { useAction, useMutation } from "convex/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "#/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import {
  isPackageOption,
  isUseCaseOption,
  packageOptions,
  useCaseOptions,
} from "#/lib/showcase-options";
import { env } from "#/env";
import { Button } from "./ui/button";

function slugifyProjectName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadImage(
  file: File,
  generateUploadUrl: () => Promise<string>,
  getFileUrl: (args: { storageId: Id<"_storage"> }) => Promise<string>,
): Promise<string> {
  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    body: file,
    headers: {
      "Content-Type": file.type,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to upload the image.");
  }

  const payload = await response.json();

  return await getFileUrl({ storageId: payload.storageId });
}

const formSchema = z
  .object({
    projectName: z
      .string()
      .min(2, "Project name must be at least 2 characters.")
      .max(100, "Project name must be at most 100 characters."),
    projectUrl: z.url("Enter a valid project URL."),
    tagline: z
      .string()
      .min(10, "Tagline must be at least 10 characters.")
      .max(500, "Tagline must be at most 500 characters."),
    description: z
      .string()
      .min(30, "Description must be at least 30 characters.")
      .max(2000, "Description must be at most 2000 characters."),
    screenshot: z
      .file()
      .mime([
        "image/apng",
        "image/avif",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ])
      .nullable(),
    logo: z
      .file()
      .mime([
        "image/apng",
        "image/avif",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ])
      .nullable(),
    isOpenSource: z.boolean(),
    repositoryUrl: z.string(),
    libraries: z.array(z.enum(packageOptions)).min(1, "Select at least one library."),
    useCases: z.array(z.enum(useCaseOptions)).min(1, "Select at least one use case."),
  })
  .superRefine((value, ctx) => {
    if (value.isOpenSource && value.repositoryUrl.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Repository URL is required for open source projects.",
        path: ["repositoryUrl"],
      });
    }

    if (value.repositoryUrl.trim().length > 0 && !z.url().safeParse(value.repositoryUrl).success) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid repository URL.",
        path: ["repositoryUrl"],
      });
    }
  });

function getDefaultValues(project: Doc<"projects">): z.infer<typeof formSchema> {
  return {
    description: project.description,
    isOpenSource: project.isOpenSource,
    libraries: project.packageNames,
    logo: null,
    projectName: project.name,
    projectUrl: project.projectUrl,
    repositoryUrl: project.repositoryUrl ?? "",
    screenshot: null,
    tagline: project.tagline,
    useCases: project.useCases,
  };
}

type EditProjectProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Doc<"projects">;
};

export default function EditProject({ onOpenChange, open, project }: EditProjectProps) {
  const navigate = useNavigate();
  const wallet = useWallet();
  const [removeLogo, setRemoveLogo] = useState(false);
  const libraryAnchor = useComboboxAnchor();
  const useCaseAnchor = useComboboxAnchor();
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getFileUrl);
  const requestChallenge = useMutation(api.walletChallenges.requestChallenge);
  const updateProject = useAction(api.projectsSubmit.updateProject);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: getDefaultValues(project),
    resolver: zodResolver(formSchema),
  });
  const tagline = useWatch({ control: form.control, name: "tagline" });
  const isOpenSource = useWatch({
    control: form.control,
    name: "isOpenSource",
  });
  const screenshotFile = useWatch({
    control: form.control,
    name: "screenshot",
  });
  const logoFile = useWatch({ control: form.control, name: "logo" });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(getDefaultValues(project));
    setRemoveLogo(false);
  }, [form, open, project]);

  useEffect(() => {
    if (!screenshotFile) {
      setScreenshotPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(screenshotFile);
    setScreenshotPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [screenshotFile]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile]);

  const currentScreenshotPreview = screenshotPreview ?? project.screenshotUrl;
  const currentLogoPreview = logoPreview ?? (removeLogo ? null : (project.logoUrl ?? null));

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!wallet.session) {
      toast.error("Connect your wallet before editing a project.");
      return;
    }

    if (wallet.session.chain.network !== env.VITE_HEDERA_NETWORK) {
      toast.error(`Connect a ${env.VITE_HEDERA_NETWORK} wallet before editing a project.`);
      return;
    }

    try {
      const screenshotUrl =
        values.screenshot !== null
          ? await uploadImage(values.screenshot, generateUploadUrl, getFileUrl)
          : project.screenshotUrl;
      const logoUrl = removeLogo
        ? undefined
        : values.logo !== null
          ? await uploadImage(values.logo, generateUploadUrl, getFileUrl)
          : project.logoUrl;
      const challenge = await requestChallenge({
        accountId: wallet.session.accountId,
        action: "edit_project",
        domain: window.location.host,
      });
      const signatureMap = await wallet.session.signer.signMessage(challenge.message);
      const nextSlug = slugifyProjectName(values.projectName);

      await updateProject({
        accountId: wallet.session.accountId,
        challengeId: challenge.challengeId,
        description: values.description,
        isOpenSource: values.isOpenSource,
        logoUrl,
        name: values.projectName,
        packageNames: values.libraries,
        projectId: project._id,
        projectUrl: values.projectUrl,
        repositoryUrl: values.repositoryUrl.trim() || undefined,
        screenshotUrl,
        signatureMap,
        slug: nextSlug,
        tagline: values.tagline,
        useCases: values.useCases,
      });

      toast.success("Project updated.");
      onOpenChange(false);

      if (nextSlug !== project.slug) {
        await navigate({
          params: { slug: nextSlug },
          to: "/showcase/$slug",
        });
        return;
      }

      await navigate({
        params: { slug: nextSlug },
        replace: true,
        to: "/showcase/$slug",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update the project.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit your project</DialogTitle>
          <DialogDescription>
            Update your showcase details. You will sign a wallet challenge before changes are saved.
          </DialogDescription>
        </DialogHeader>
        <form
          className="max-h-[75lvh] overflow-y-auto overflow-x-visible no-scrollbar"
          id="edit-project-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="projectName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-name">Project name</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="edit-project-name"
                    placeholder="Hashfolio"
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="projectUrl"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-url">Project URL</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="edit-project-url"
                    placeholder="https://example.com"
                    type="url"
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="tagline"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-tagline">Tagline</FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="edit-project-tagline"
                      maxLength={500}
                      placeholder="A short, punchy summary of what your project does."
                    />
                    <FieldDescription>{tagline.length}/500 characters</FieldDescription>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-description">Description</FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="edit-project-description"
                      placeholder="Tell people what your project does, who it is for, and why you built it."
                      rows={6}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="screenshot"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-screenshot">Screenshot</FieldLabel>
                  <FieldContent>
                    <Input
                      accept="image/*"
                      aria-invalid={fieldState.invalid}
                      id="edit-project-screenshot"
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
                      ref={field.ref}
                      type="file"
                    />
                    <FieldDescription>
                      Use a 16:9 image for the showcase card, ideally at least 1600 by 900.
                    </FieldDescription>
                    {currentScreenshotPreview ? (
                      <div className="overflow-hidden rounded-xl border">
                        <div className="aspect-video">
                          <img
                            alt="Screenshot preview"
                            className="size-full object-cover"
                            src={currentScreenshotPreview}
                          />
                        </div>
                      </div>
                    ) : null}
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="logo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-project-logo">Logo</FieldLabel>
                  <FieldContent>
                    <Input
                      accept="image/*"
                      aria-invalid={fieldState.invalid}
                      id="edit-project-logo"
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={(event) => {
                        setRemoveLogo(false);
                        field.onChange(event.target.files?.[0] ?? null);
                      }}
                      ref={field.ref}
                      type="file"
                    />
                    <FieldDescription>
                      Use a square logo so it crops cleanly in the project card.
                    </FieldDescription>
                    {currentLogoPreview ? (
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded-xl aspect-square size-14 border">
                          <img
                            alt="Logo preview"
                            className="size-full object-contain"
                            src={currentLogoPreview}
                          />
                        </div>
                        <Button
                          onClick={() => {
                            field.onChange(null);
                            setRemoveLogo(true);
                          }}
                          type="button"
                          variant="outline"
                        >
                          Remove Logo
                        </Button>
                      </div>
                    ) : null}
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="isOpenSource"
              render={({ field }) => (
                <Field className="items-center" orientation="horizontal">
                  <Switch
                    checked={field.value}
                    id="edit-project-open-source"
                    name={field.name}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent className="gap-0.5">
                    <FieldLabel htmlFor="edit-project-open-source">Open source</FieldLabel>
                    <FieldDescription>
                      Turn this on if the project source is publicly available.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
            {isOpenSource ? (
              <Controller
                control={form.control}
                name="repositoryUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-project-repository-url">Repository URL</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="edit-project-repository-url"
                      placeholder="https://github.com/your-org/your-project"
                      type="url"
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            ) : null}
            <Controller
              control={form.control}
              name="libraries"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Libraries used</FieldLabel>
                  <FieldContent>
                    <Combobox
                      items={[...packageOptions]}
                      multiple
                      onValueChange={(nextValue) =>
                        field.onChange(nextValue.filter(isPackageOption))
                      }
                      value={field.value}
                    >
                      <ComboboxChips className="w-full rounded-xl px-3 py-2" ref={libraryAnchor}>
                        <ComboboxValue>
                          {(values) => (
                            <>
                              {values.map((selectedValue: string) => (
                                <ComboboxChip key={selectedValue}>{selectedValue}</ComboboxChip>
                              ))}
                              <ComboboxChipsInput placeholder="Select libraries" />
                            </>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={libraryAnchor}>
                        <ComboboxEmpty>No matches found.</ComboboxEmpty>
                        <ComboboxList>
                          <ComboboxCollection>
                            {(option: string) => (
                              <ComboboxItem key={option} value={option}>
                                {option}
                              </ComboboxItem>
                            )}
                          </ComboboxCollection>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FieldDescription>
                      Pick every Hiero or Hieco library your project depends on.
                    </FieldDescription>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="useCases"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Use cases</FieldLabel>
                  <FieldContent>
                    <Combobox
                      items={[...useCaseOptions]}
                      multiple
                      onValueChange={(nextValue) =>
                        field.onChange(nextValue.filter(isUseCaseOption))
                      }
                      value={field.value}
                    >
                      <ComboboxChips className="w-full rounded-xl px-3 py-2" ref={useCaseAnchor}>
                        <ComboboxValue>
                          {(values) => (
                            <>
                              {values.map((selectedValue: string) => (
                                <ComboboxChip key={selectedValue}>{selectedValue}</ComboboxChip>
                              ))}
                              <ComboboxChipsInput placeholder="Select use cases" />
                            </>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={useCaseAnchor}>
                        <ComboboxEmpty>No matches found.</ComboboxEmpty>
                        <ComboboxList>
                          <ComboboxCollection>
                            {(option: string) => (
                              <ComboboxItem key={option} value={option}>
                                {option}
                              </ComboboxItem>
                            )}
                          </ComboboxCollection>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <FieldDescription>
                      Choose the web3 categories that best describe your project.
                    </FieldDescription>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button disabled={form.formState.isSubmitting} form="edit-project-form" type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
