import { useEffect, useId, useState } from "react";
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
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { Button } from "./ui/button";

const packageOptions = [
  "Hieco Mirror",
  "Hieco Mirror CLI",
  "Hieco Mirror MCP",
  "Hieco Mirror Preact",
  "Hieco Mirror React",
  "Hieco Mirror Solid",
  "Hieco React",
  "Hieco Realtime",
  "Hieco Realtime React",
  "Hieco SDK",
  "Hieco Wallet",
  "Hieco Wallet React",
  "Hiero SDK",
] as const;

const useCaseOptions = [
  "Payments",
  "Tokenized Loyalty",
  "NFT Marketplace",
  "Gaming",
  "Wallet Infrastructure",
  "Onchain Identity",
  "DAO Tools",
  "DeFi",
  "Social",
  "Real World Assets",
  "Supply Chain",
  "Developer Tools",
] as const;

const SubmitProject = () => {
  const libraryAnchor = useComboboxAnchor();
  const useCaseAnchor = useComboboxAnchor();
  const projectNameId = useId();
  const projectUrlId = useId();
  const taglineId = useId();
  const descriptionId = useId();
  const screenshotId = useId();
  const logoId = useId();
  const openSourceId = useId();
  const repositoryUrlId = useId();
  const [isOpenSource, setIsOpenSource] = useState(false);
  const [tagline, setTagline] = useState("");
  const [libraries, setLibraries] = useState<Array<string>>([]);
  const [useCases, setUseCases] = useState<Array<string>>([]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null,
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

  return (
    <Dialog>
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
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor={projectNameId}>Project name</FieldLabel>
              <Input
                id={projectNameId}
                name="projectName"
                placeholder="Hashfolio"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={projectUrlId}>Project URL</FieldLabel>
              <Input
                id={projectUrlId}
                name="projectUrl"
                placeholder="https://example.com"
                type="url"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={taglineId}>Tagline</FieldLabel>
              <FieldContent>
                <Textarea
                  id={taglineId}
                  name="tagline"
                  maxLength={500}
                  placeholder="A short, punchy summary of what your project does."
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                />
                <FieldDescription>
                  {tagline.length}/500 characters
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={descriptionId}>Description</FieldLabel>
              <Textarea
                id={descriptionId}
                name="description"
                placeholder="Tell people what your project does, who it is for, and why you built it."
                rows={6}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={screenshotId}>Screenshot</FieldLabel>
              <FieldContent>
                <Input
                  id={screenshotId}
                  name="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setScreenshotFile(event.target.files?.[0] ?? null);
                  }}
                />
                <FieldDescription>
                  Use a 16:9 image for the showcase card, ideally at least 1600
                  by 900.
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
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor={logoId}>Logo</FieldLabel>
              <FieldContent>
                <Input
                  id={logoId}
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setLogoFile(event.target.files?.[0] ?? null);
                  }}
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
              </FieldContent>
            </Field>
            <Field orientation="horizontal" className="items-center">
              <Switch
                checked={isOpenSource}
                id={openSourceId}
                name="isOpenSource"
                onCheckedChange={setIsOpenSource}
              />
              <FieldContent className="gap-0.5">
                <FieldLabel htmlFor={openSourceId}>Open source</FieldLabel>
                <FieldDescription>
                  Turn this on if the project source is publicly available.
                </FieldDescription>
              </FieldContent>
            </Field>
            {isOpenSource ? (
              <Field>
                <FieldLabel htmlFor={repositoryUrlId}>
                  Repository URL
                </FieldLabel>
                <Input
                  id={repositoryUrlId}
                  name="repositoryUrl"
                  placeholder="https://github.com/your-org/your-project"
                  type="url"
                />
              </Field>
            ) : null}
            <Field>
              <FieldLabel>Libraries used</FieldLabel>
              <FieldContent>
                <Combobox
                  multiple
                  items={[...packageOptions]}
                  value={libraries}
                  onValueChange={(nextValue) => setLibraries([...nextValue])}
                >
                  <ComboboxChips
                    ref={libraryAnchor}
                    className="w-full rounded-xl px-3 py-2"
                  >
                    <ComboboxValue>
                      {(values) => (
                        <>
                          {values.map((selectedValue: string) => (
                            <ComboboxChip key={selectedValue}>
                              {selectedValue}
                            </ComboboxChip>
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
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Use cases</FieldLabel>
              <FieldContent>
                <Combobox
                  multiple
                  items={[...useCaseOptions]}
                  value={useCases}
                  onValueChange={(nextValue) => setUseCases([...nextValue])}
                >
                  <ComboboxChips
                    ref={useCaseAnchor}
                    className="w-full rounded-xl px-3 py-2"
                  >
                    <ComboboxValue>
                      {(values) => (
                        <>
                          {values.map((selectedValue: string) => (
                            <ComboboxChip key={selectedValue}>
                              {selectedValue}
                            </ComboboxChip>
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
              </FieldContent>
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button type="submit">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitProject;
