import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation } from "convex/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useWallet } from "@hieco/wallet-react";
import {
  isPackageOption,
  isUseCaseOption,
  packageOptions,
  useCaseOptions,
} from "#/lib/showcase-options";
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
  DialogTrigger,
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
    method: "POST",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
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
      ]),
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
    if (value.screenshot === null) {
      ctx.addIssue({
        code: "custom",
        message: "Screenshot is required.",
        path: ["screenshot"],
      });
    }

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

const SubmitProject = () => {
  const wallet = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const libraryAnchor = useComboboxAnchor();
  const useCaseAnchor = useComboboxAnchor();
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getFileUrl);
  const requestChallenge = useMutation(api.walletChallenges.requestChallenge);
  const submitProject = useAction(api.projectsSubmit.submitProject);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      projectUrl: "",
      tagline: "",
      description: "",
      logo: null,
      isOpenSource: false,
      repositoryUrl: "",
      libraries: [],
      useCases: [],
    },
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!wallet.session) {
      toast.error("Connect your wallet before submitting a project.");
      return;
    }

    const screenshotUrl = await uploadImage(values.screenshot, generateUploadUrl, getFileUrl);
    const logoUrl = values.logo
      ? await uploadImage(values.logo, generateUploadUrl, getFileUrl)
      : undefined;
    const challenge = await requestChallenge({
      accountId: wallet.session.accountId,
      action: "submit_project",
      domain: window.location.host,
    });
    const signatureMap = await wallet.session.signer.signMessage(challenge.message);

    await submitProject({
      challengeId: challenge.challengeId,
      accountId: wallet.session.accountId,
      name: values.projectName,
      slug: slugifyProjectName(values.projectName),
      projectUrl: values.projectUrl,
      isOpenSource: values.isOpenSource,
      repositoryUrl: values.repositoryUrl.trim() || undefined,
      screenshotUrl,
      description: values.description,
      logoUrl,
      tagline: values.tagline,
      useCases: values.useCases,
      packageNames: values.libraries,
      signatureMap,
    });

    form.reset();

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button size="lg">Submit Yours</Button>} />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit your project</DialogTitle>
          <DialogDescription>
            Share what you built with the Hiero and Hieco ecosystem.
          </DialogDescription>
        </DialogHeader>
        <form
          className="max-h-[75lvh] overflow-y-auto overflow-x-visible no-scrollbar"
          id="submit-project-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="projectName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="submit-project-name">Project name</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="submit-project-name"
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
                  <FieldLabel htmlFor="submit-project-url">Project URL</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="submit-project-url"
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
                  <FieldLabel htmlFor="submit-project-tagline">Tagline</FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="submit-project-tagline"
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
                  <FieldLabel htmlFor="submit-project-description">Description</FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="submit-project-description"
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
                  <FieldLabel htmlFor="submit-project-screenshot">Screenshot</FieldLabel>
                  <FieldContent>
                    <Input
                      accept="image/*"
                      aria-invalid={fieldState.invalid}
                      id="submit-project-screenshot"
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
                      ref={field.ref}
                      type="file"
                    />
                    <FieldDescription>
                      Use a 16:9 image for the showcase card, ideally at least 1600 by 900.
                    </FieldDescription>
                    {screenshotPreview ? (
                      <div className="overflow-hidden rounded-xl border">
                        <div className="aspect-video">
                          <img
                            alt="Screenshot preview"
                            className="size-full object-cover"
                            src={screenshotPreview}
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
                  <FieldLabel htmlFor="submit-project-logo">Logo</FieldLabel>
                  <FieldContent>
                    <Input
                      accept="image/*"
                      aria-invalid={fieldState.invalid}
                      id="submit-project-logo"
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
                      ref={field.ref}
                      type="file"
                    />
                    <FieldDescription>
                      Use a square logo so it crops cleanly in the project card.
                    </FieldDescription>
                    {logoPreview ? (
                      <div className="bg-white p-2 rounded-xl aspect-square size-14 border">
                        <img
                          alt="Logo preview"
                          className="size-full object-contain"
                          src={logoPreview}
                        />
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
                <Field orientation="horizontal" className="items-center">
                  <Switch
                    checked={field.value}
                    id="submit-project-open-source"
                    name={field.name}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent className="gap-0.5">
                    <FieldLabel htmlFor="submit-project-open-source">Open source</FieldLabel>
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
                    <FieldLabel htmlFor="submit-project-repository-url">Repository URL</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="submit-project-repository-url"
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
                      multiple
                      items={[...packageOptions]}
                      onValueChange={(nextValue) =>
                        field.onChange(nextValue.filter(isPackageOption))
                      }
                      value={field.value}
                    >
                      <ComboboxChips ref={libraryAnchor} className="w-full rounded-xl px-3 py-2">
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
                      multiple
                      items={[...useCaseOptions]}
                      onValueChange={(nextValue) =>
                        field.onChange(nextValue.filter(isUseCaseOption))
                      }
                      value={field.value}
                    >
                      <ComboboxChips ref={useCaseAnchor} className="w-full rounded-xl px-3 py-2">
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
          <Button disabled={form.formState.isSubmitting} form="submit-project-form" type="submit">
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitProject;
