"use client";

import {
  jobData,
  roleData,
  skillData,
  countriesData,
  paymentOptionData,
  notificationOptionData,
} from "@/utils/FakeData";

import {
  LuEye,
  LuTag,
  LuLock,
  LuUser,
  LuMail,
  LuGlobe,
  LuSearch,
  LuEyeOff,
  LuBriefcase,
} from "react-icons/lu";

import { useState } from "react";
import { Input } from "@/components/ui/input/Input";
import { demoFormState } from "@/utils/initialState";
import { TextEditor } from "../text-editor/TextEditor";
import { Select } from "@/components/ui/select/Select";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { FileUpload } from "@/components/ui/input/FileUpload";
import { RadioGroup } from "@/components/ui/radio/RadioGroup";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { CheckboxGroup } from "@/components/ui/checkbox/CheckboxGroup";
import { MultipleSearchSelect } from "@/components/ui/select/MultipleSearchSelect";

export default function FormExample() {
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState(demoFormState);

  //   Image upload
  const handleImageUpload = async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        resolve(url);
      }, 1000);
    });
  };

  //   Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form values:", formValues);
    alert(
      `Form submitted with values:\n${JSON.stringify(formValues, null, 2)}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto my-20">
      <h2>Form Ui</h2>

      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Search"
          placeholder="Search anything..."
          startIcon={<LuSearch className="h-4 w-4" />}
          fullWidth
          helperText="Enter your search query"
          onValueChange={(value) => {
            setFormValues((prev) => ({ ...prev, search: value }));
          }}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          startIcon={<LuMail className="h-4 w-4" />}
          fullWidth
          onValueChange={(value) => {
            setEmailValue(value);
            setFormValues((prev) => ({ ...prev, email: value }));
          }}
          error={
            formValues?.email && !formValues?.email?.includes("@")
              ? "Please enter a valid email"
              : ""
          }
        />

        <Select
          label="Country"
          placeholder="Select your country"
          options={countriesData}
          startIcon={<LuGlobe className="h-4 w-4" />}
          fullWidth
          helperText="Select the country you're based in"
          defaultValue={formValues?.country}
          onValueChange={(value) => {
            setFormValues((prev) => ({ ...prev, country: value }));
          }}
        />
        <Select
          label="Role"
          placeholder="Select your role"
          options={roleData}
          startIcon={<LuUser className="h-4 w-4" />}
          fullWidth
          onValueChange={(value) => {
            setFormValues((prev) => ({ ...prev, role: value }));
          }}
          error={!formValues?.role ? "Please select a role" : ""}
        />

        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          startIcon={<LuLock className="h-4 w-4" />}
          endIcon={
            showPassword ? (
              <LuEye
                className="h-4 w-4 cursor-pointer"
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <LuEyeOff
                className="h-4 w-4 cursor-pointer"
                onClick={() => setShowPassword(true)}
              />
            )
          }
          fullWidth
          onValueChange={(value) => {
            setPasswordValue(value);
            setFormValues((prev) => ({ ...prev, password: value }));
          }}
        />

        <SearchSelect
          label="Job Title"
          placeholder="Select your job title"
          searchPlaceholder="Search for a job title..."
          options={jobData}
          startIcon={<LuBriefcase className="h-4 w-4" />}
          fullWidth
          helperText="Search and select your job title"
          onValueChange={(value) => {
            setJobValue(value);
            setFormValues((prev) => ({ ...prev, job: value }));
          }}
        />

        <MultipleSearchSelect
          label="Skills"
          placeholder="Select your skills"
          searchPlaceholder="Search for skills..."
          options={skillData}
          startIcon={<LuTag className="h-4 w-4" />}
          fullWidth
          helperText="Select up to 5 skills"
          maxItems={5}
          value={formValues.skills}
          onValueChange={(values) => {
            console.log("Skills values received:", values);
            setFormValues((prev) => {
              const newState = { ...prev, skills: values };
              console.log("New form state:", newState);
              return newState;
            });
          }}
        />
      </div>

      <div className="flex justify-between">
        <CheckboxGroup
          label="Notification Preferences"
          options={notificationOptionData}
          helperText="Select how you'd like to be notified"
          orientation="vertical"
          value={formValues.notificationPreferences}
          onValueChange={(values) => {
            setFormValues((prev) => ({
              ...prev,
              notificationPreferences: values,
            }));
          }}
        />

        <Checkbox
          label="I agree to the Terms and Conditions"
          checked={formValues.termsAccepted}
          onValueChange={(checked) => {
            setFormValues((prev) => ({ ...prev, termsAccepted: checked }));
          }}
          error={
            formValues.termsAccepted
              ? ""
              : "You must accept the terms to continue"
          }
        />

        <RadioGroup
          label="Payment Method"
          options={paymentOptionData}
          name="payment"
          value={formValues.paymentMethod}
          helperText="Select your preferred payment method"
          onValueChange={(value) => {
            setFormValues((prev) => ({ ...prev, paymentMethod: value }));
          }}
          orientation="vertical"
        />
      </div>

      <FileUpload
        label="Profile Image"
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        helperText="Upload your profile picture (max 2MB)"
        value={formValues.profileImage}
        onValueChange={(files) => {
          setFormValues((prev) => ({ ...prev, profileImage: files }));
        }}
        multiple={false}
        previewMaxHeight={150}
      />

      <div className=" mb-20">
        <TextEditor
          label="Content"
          placeholder="Start writing your content..."
          value={formValues.content}
          onValueChange={(html) => {
            setFormValues((prev) => ({ ...prev, content: html }));
          }}
          helperText="Use the toolbar to format your content, add links, and insert images."
          minHeight="300px"
          maxHeight="500px"
          imageUploadHandler={handleImageUpload}
        />
      </div>

      <div className="p-4 bg-gray-100 rounded-md">
        <h3 className="text-sm font-medium mb-2">Current Values:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(formValues, null, 2)}
        </pre>
      </div>
    </form>
  );
}
