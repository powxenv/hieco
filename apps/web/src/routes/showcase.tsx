import SolarMinimalisticMagniferLineDuotone from "~icons/solar/minimalistic-magnifer-line-duotone";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import heroImg from "../assets/hero.jpeg";
import { createFileRoute } from "@tanstack/react-router";
import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import SolarBoxLineDuotone from "~icons/solar/box-line-duotone";
import SolarBranchingPathsUpLineDuotone from "~icons/solar/branching-paths-up-line-duotone";
import { Badge } from "#/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip";
import { useWallet } from "@hieco/wallet-react";
import SubmitProject from "#/components/submit-project";

export const Route = createFileRoute("/showcase")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useWallet();

  return (
    <>
      <div className="h-60 relative">
        <img
          className="absolute size-full object-cover object-top"
          src={heroImg}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white"></div>
      </div>
      <section className="relative">
        <div className="inner">
          <h1 className="text-6xl font-bold">Showcase</h1>
          <p className="text-xl max-w-md my-4">
            Discover projects yang dibuat di hedera network dan dibuat
            menggunakan ekosistem hiero dan hieco.
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
              <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
            </InputGroup>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="w-fit">
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
                        <Checkbox id="terms-checkbox" name="terms-checkbox" />
                        <Label htmlFor="terms-checkbox">Hieco SDK</Label>
                      </Field>
                    </FieldGroup>
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="w-fit">
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
                        <Checkbox id="terms-checkbox" name="terms-checkbox" />
                        <Label htmlFor="terms-checkbox">Something</Label>
                      </Field>
                    </FieldGroup>
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            <Field orientation="horizontal" className="w-fit">
              <Switch id="switch-disabled-unchecked" />
              <FieldLabel htmlFor="switch-disabled-unchecked">
                Open Source
              </FieldLabel>
            </Field>
            {session && (
              <Field orientation="horizontal" className="w-fit">
                <Switch id="switch-disabled-unchecked" />
                <FieldLabel htmlFor="switch-disabled-unchecked">
                  Hide Yours
                </FieldLabel>
              </Field>
            )}
          </div>
        </div>
      </section>
      <section className="py-10">
        <div className="inner">
          <h2 className="text-2xl mb-4 font-semibold">Your Projects</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="aspect-video rounded-xl overflow-hidden">
                <img
                  src="https://picsum.photos/1600/900"
                  className="object-cover size-full"
                />
              </div>
              <div className="-translate-y-8 px-4">
                <div className="bg-white border p-2 rounded-xl aspect-square size-14">
                  <svg
                    className="size-full"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 0C9.50659 0 1 8.50659 1 19V20.1719L4 23.1719V19C4 10.1634 11.1634 3 20 3C28.8366 3 36 10.1634 36 19V23.1719L39 20.1719V19C39 8.50659 30.4934 0 20 0ZM20 10C15.0294 10 11 14.0294 11 19V31.0498C11 31.5743 10.5743 32 10.0498 32C9.7981 31.9999 9.55691 31.8997 9.37891 31.7217L0 22.3428V26.585L7.25781 33.8428C7.99842 34.5834 9.00245 34.9999 10.0498 35C12.2312 35 14 33.2312 14 31.0498V19C14 15.6863 16.6863 13 20 13C23.3137 13 26 15.6863 26 19V31.0498C26 33.2312 27.7688 35 29.9502 35C30.9976 34.9999 32.0016 34.5834 32.7422 33.8428L34.7066 31.8785L37.7066 28.8785L40 26.585V22.3428L37.8789 24.4639L35.5854 26.7574L32.5854 29.7574L30.6211 31.7217C30.4431 31.8997 30.2019 31.9999 29.9502 32C29.4257 32 29 31.5743 29 31.0498V19C29 14.0294 24.9706 10 20 10ZM20 15C17.7909 15 16 16.7909 16 19V31.0498C16 34.3358 13.3358 37 10.0498 37C8.47201 36.9999 6.95846 36.3735 5.84277 35.2578L0 29.4141V33.6562L3.72168 37.3789C5.39997 39.0572 7.67636 39.9999 10.0498 40C14.9926 40 19 35.9926 19 31.0498V19C19 18.4477 19.4477 18 20 18C20.5523 18 21 18.4477 21 19V31.0498C21 35.9926 25.0074 40 29.9502 40C32.3236 39.9999 34.6 39.0572 36.2783 37.3789L40 33.6562V29.4141L34.1572 35.2578C33.0415 36.3735 31.528 36.9999 29.9502 37C26.6642 37 24 34.3358 24 31.0498V19C24 16.7909 22.2091 15 20 15ZM20 5C12.268 5 6 11.268 6 19V25.1719L9 28.1719V19C9 12.9249 13.9249 8 20 8C26.0751 8 31 12.9249 31 19V28.1719L34 25.1719V19C34 11.268 27.732 5 20 5Z"
                      fill="#FF3902"
                    ></path>
                  </svg>
                </div>
                <div className="my-2">
                  <h3 className="text-2xl font-bold">Project Title</h3>
                  <p className="text-lg">Project Tagline</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge>Hieco SDK</Badge>
                  <Badge>Mirror CLI</Badge>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl mb-4 font-semibold">All Projects</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="aspect-video rounded-xl overflow-hidden">
                <img
                  src="https://picsum.photos/1600/900"
                  className="object-cover size-full"
                />
              </div>
              <div className="-translate-y-8 px-4">
                <div className="bg-white border p-2 rounded-xl aspect-square size-14">
                  <svg
                    className="size-full"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 0C9.50659 0 1 8.50659 1 19V20.1719L4 23.1719V19C4 10.1634 11.1634 3 20 3C28.8366 3 36 10.1634 36 19V23.1719L39 20.1719V19C39 8.50659 30.4934 0 20 0ZM20 10C15.0294 10 11 14.0294 11 19V31.0498C11 31.5743 10.5743 32 10.0498 32C9.7981 31.9999 9.55691 31.8997 9.37891 31.7217L0 22.3428V26.585L7.25781 33.8428C7.99842 34.5834 9.00245 34.9999 10.0498 35C12.2312 35 14 33.2312 14 31.0498V19C14 15.6863 16.6863 13 20 13C23.3137 13 26 15.6863 26 19V31.0498C26 33.2312 27.7688 35 29.9502 35C30.9976 34.9999 32.0016 34.5834 32.7422 33.8428L34.7066 31.8785L37.7066 28.8785L40 26.585V22.3428L37.8789 24.4639L35.5854 26.7574L32.5854 29.7574L30.6211 31.7217C30.4431 31.8997 30.2019 31.9999 29.9502 32C29.4257 32 29 31.5743 29 31.0498V19C29 14.0294 24.9706 10 20 10ZM20 15C17.7909 15 16 16.7909 16 19V31.0498C16 34.3358 13.3358 37 10.0498 37C8.47201 36.9999 6.95846 36.3735 5.84277 35.2578L0 29.4141V33.6562L3.72168 37.3789C5.39997 39.0572 7.67636 39.9999 10.0498 40C14.9926 40 19 35.9926 19 31.0498V19C19 18.4477 19.4477 18 20 18C20.5523 18 21 18.4477 21 19V31.0498C21 35.9926 25.0074 40 29.9502 40C32.3236 39.9999 34.6 39.0572 36.2783 37.3789L40 33.6562V29.4141L34.1572 35.2578C33.0415 36.3735 31.528 36.9999 29.9502 37C26.6642 37 24 34.3358 24 31.0498V19C24 16.7909 22.2091 15 20 15ZM20 5C12.268 5 6 11.268 6 19V25.1719L9 28.1719V19C9 12.9249 13.9249 8 20 8C26.0751 8 31 12.9249 31 19V28.1719L34 25.1719V19C34 11.268 27.732 5 20 5Z"
                      fill="#FF3902"
                    ></path>
                  </svg>
                </div>
                <div className="my-2">
                  <h3 className="text-2xl font-bold">Project Title</h3>
                  <p className="text-lg">Project Tagline</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge>Hieco SDK</Badge>
                  <Badge>Mirror CLI</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
