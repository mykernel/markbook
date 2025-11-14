---
name: shadcn-ui-guidelines
description: shadcn/ui component library guidelines for React/TypeScript. Covers installation, component usage, customization, Tailwind CSS integration, dark mode, form handling with react-hook-form and zod, and best practices for building modern UIs with shadcn/ui.
---

# shadcn/ui Development Guidelines

## Purpose

Comprehensive guide for building modern React applications with shadcn/ui - a collection of re-usable components built with Radix UI and Tailwind CSS.

## When to Use This Skill

- Setting up shadcn/ui in a project
- Adding shadcn/ui components
- Customizing component styles
- Building forms with shadcn/ui
- Implementing dark mode
- Creating consistent UI patterns
- Working with Tailwind CSS

---

## Why shadcn/ui?

### ✅ Advantages

- **Not a dependency** - Copy components into your project, you own the code
- **Fully customizable** - Modify components to fit your needs
- **Accessible** - Built on Radix UI primitives
- **TypeScript first** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Composable** - Small, focused components
- **No runtime overhead** - Just React components

### 📦 What You Get

- 50+ pre-built components
- Form components with validation
- Data table patterns
- Dialog/Sheet/Drawer patterns
- Toast notifications
- Command palette
- Dark mode support

---

## Quick Start

### 1. Initialize shadcn/ui

```bash
# For new Next.js project
npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app

# For new Vite project
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install

# Initialize shadcn/ui
npx shadcn@latest init
```

**Configuration prompts:**
```
? Which style would you like to use? › Default
? Which color would you like to use as base color? › Zinc
? Would you like to use CSS variables for colors? › yes
```

This creates:
- `components/ui/` - UI components directory
- `lib/utils.ts` - Utility functions
- `components.json` - Configuration
- Updated `tailwind.config.js`

---

### 2. Add Components

```bash
# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add form

# Add multiple components
npx shadcn@latest add button card input form dialog
```

Components are copied to `components/ui/` and you can modify them!

---

## Core Components Guide

### Button

```tsx
import { Button } from "@/components/ui/button";

export function ButtonDemo() {
  return (
    <div className="flex gap-2">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}

// With icons
import { Mail } from "lucide-react";

<Button>
  <Mail className="mr-2 h-4 w-4" />
  Login with Email
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

---

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CardDemo() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Content here */}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
}
```

---

### Form with Validation

```bash
# Install dependencies
npm install react-hook-form @hookform/resolvers zod

# Add form components
npx shadcn@latest add form input label
```

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

// Define schema
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function ProfileForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: FormData) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

### Dialog (Modal)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Form content */}
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Data Table

```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function UserTable({ users }: { users: User[] }) {
  return (
    <Table>
      <TableCaption>A list of your recent users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">Edit</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

### Toast Notifications

```bash
npx shadcn@latest add toast
```

```tsx
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export function ToastDemo() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
        });
      }}
    >
      Show Toast
    </Button>
  );
}

// Success toast
toast({
  title: "Success",
  description: "Your profile has been updated.",
});

// Error toast
toast({
  variant: "destructive",
  title: "Uh oh! Something went wrong.",
  description: "There was a problem with your request.",
});

// With action
toast({
  title: "Undo",
  description: "Your changes have been saved.",
  action: <Button variant="outline" size="sm">Undo</Button>,
});
```

---

## Dark Mode Setup

```bash
npm install next-themes
```

```tsx
// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}

// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// components/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

---

## Customization

### Modify Component Styles

Components are in `components/ui/` - you can edit them directly!

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground...",
        // Add custom variant
        success: "bg-green-500 text-white hover:bg-green-600",
      },
    },
  }
);

// Usage
<Button variant="success">Success</Button>
```

### Update Theme Colors

**Manual Method:**

```tsx
// app/globals.css
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... customize other colors */
  }

  .dark {
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}
```

---

## Theme Builder Tool - shadcnthemer.com 🎨

**The easiest way to create custom themes!**

### What is shadcnthemer.com?

A visual theme builder and marketplace for shadcn/ui that lets you:
- 🎨 Browse thousands of community-created themes
- ✨ Create custom themes with visual editor
- 🌈 Use OKLCH color picker for precise colors
- 📦 Export themes for instant use
- 🔤 Select Google Fonts
- ⚙️ Adjust border radius
- 🌓 Design both light and dark modes

**Website**: https://shadcnthemer.com/

---

### Quick Start with Themer

#### 1. Browse and Select a Theme

Visit https://shadcnthemer.com/ and filter by:
- **Colors**: Red, Orange, Yellow, Green, Cyan, Blue, Purple, Pink, Gray, Black, White
- **Style**: Modern, Classic, Vibrant, Minimal, etc.
- **Popularity**: Community favorites

#### 2. Export Theme Configuration

Click "Export" on any theme to get CSS variables:

```css
/* Example: "Ocean Blue" Theme */
@layer base {
  :root {
    /* Primary Colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;

    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;

    --ring: 224.3 76.3% 48%;
  }
}
```

#### 3. Apply Theme to Your Project

```bash
# 1. Copy the CSS from shadcnthemer.com
# 2. Paste into your globals.css
vi app/globals.css

# 3. That's it! Theme is applied.
```

---

### Popular Theme Examples

#### 1. "GitHub Dark" Theme

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 210 12% 16%;
    --primary: 212 12% 43%;
    --primary-foreground: 0 0% 98%;
    --secondary: 210 16% 93%;
    --secondary-foreground: 210 12% 16%;
    --accent: 210 16% 93%;
    --accent-foreground: 210 12% 16%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --muted: 210 16% 93%;
    --muted-foreground: 210 12% 43%;
    --card: 0 0% 100%;
    --card-foreground: 210 12% 16%;
    --popover: 0 0% 100%;
    --popover-foreground: 210 12% 16%;
    --border: 210 20% 88%;
    --input: 210 20% 88%;
    --ring: 212 12% 43%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 220 13% 18%;
    --foreground: 0 0% 98%;
    --primary: 210 100% 66%;
    --primary-foreground: 220 13% 18%;
    --secondary: 215 14% 34%;
    --secondary-foreground: 0 0% 98%;
    --accent: 215 14% 34%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 98%;
    --muted: 215 14% 34%;
    --muted-foreground: 217 11% 65%;
    --card: 220 13% 18%;
    --card-foreground: 0 0% 98%;
    --popover: 220 13% 18%;
    --popover-foreground: 0 0% 98%;
    --border: 215 14% 34%;
    --input: 215 14% 34%;
    --ring: 210 100% 66%;
  }
}
```

#### 2. "Tokyo Night" Theme

```css
@layer base {
  :root {
    --background: 240 10% 98%;
    --foreground: 234 16% 15%;
    --primary: 267 84% 81%;
    --primary-foreground: 234 16% 15%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 234 16% 15%;
    --accent: 199 89% 48%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --muted: 220 14% 96%;
    --muted-foreground: 234 8% 45%;
    --card: 0 0% 100%;
    --card-foreground: 234 16% 15%;
    --popover: 0 0% 100%;
    --popover-foreground: 234 16% 15%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 267 84% 81%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 234 16% 15%;
    --foreground: 0 0% 98%;
    --primary: 267 84% 81%;
    --primary-foreground: 234 16% 15%;
    --secondary: 233 10% 23%;
    --secondary-foreground: 0 0% 98%;
    --accent: 199 89% 48%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --muted: 233 10% 23%;
    --muted-foreground: 234 8% 65%;
    --card: 234 16% 15%;
    --card-foreground: 0 0% 98%;
    --popover: 234 16% 15%;
    --popover-foreground: 0 0% 98%;
    --border: 233 10% 23%;
    --input: 233 10% 23%;
    --ring: 267 84% 81%;
  }
}
```

#### 3. "Emerald" Theme (Green)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 142 76% 36%;
    --primary-foreground: 356 29% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --accent: 142 76% 92%;
    --accent-foreground: 142 76% 16%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 142 76% 36%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 142 70% 45%;
    --primary-foreground: 144 61% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --accent: 142 70% 20%;
    --accent-foreground: 142 70% 90%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 142 70% 45%;
  }
}
```

---

### Creating Custom Themes

#### Step 1: Visit shadcnthemer.com

1. Go to https://shadcnthemer.com/
2. Click "Create Theme" or "Theme Editor"

#### Step 2: Customize with Visual Tools

**Color Picker (OKLCH):**
- More perceptually uniform than HSL
- Better for programmatic color manipulation
- Pick your base color

**Adjust Variables:**
- Background
- Foreground (text)
- Primary (brand color)
- Secondary
- Accent
- Destructive (error/danger)
- Muted (subtle elements)
- Border
- Input
- Ring (focus rings)

**Border Radius:**
- Adjust `--radius` for rounded corners
- Preview in real-time

**Typography:**
- Select from Google Fonts
- Set font weights

#### Step 3: Test Both Modes

Toggle between light/dark to ensure:
- ✅ Good contrast ratios (WCAG AA)
- ✅ Readable text
- ✅ Distinguishable interactive elements

#### Step 4: Export and Apply

```bash
# 1. Click "Export" button
# 2. Copy the generated CSS
# 3. Paste into your globals.css
# 4. Done!
```

---

### Understanding Color Variables

**Core Colors:**
```css
--background       /* Page background */
--foreground       /* Main text color */
--primary          /* Brand color, primary actions */
--primary-foreground /* Text on primary color */
--secondary        /* Secondary elements */
--secondary-foreground /* Text on secondary */
--accent           /* Accent highlights */
--accent-foreground /* Text on accent */
--destructive      /* Errors, delete actions */
--destructive-foreground /* Text on destructive */
--muted            /* Subtle backgrounds */
--muted-foreground /* Subtle text */
```

**Component Colors:**
```css
--card             /* Card backgrounds */
--card-foreground  /* Text in cards */
--popover          /* Popover backgrounds */
--popover-foreground /* Text in popovers */
--border           /* Border color */
--input            /* Input border color */
--ring             /* Focus ring color */
```

**Spacing:**
```css
--radius           /* Border radius (0.5rem default) */
```

---

### Color Format: HSL vs OKLCH

**HSL (Default):**
```css
--primary: 221.2 83.2% 53.3%;  /* hue saturation lightness */
```

**OKLCH (Recommended):**
```css
--primary: oklch(0.65 0.25 260);  /* lightness chroma hue */
```

**Why OKLCH?**
- ✅ More perceptually uniform
- ✅ Better for color manipulation
- ✅ Consistent brightness across hues
- ✅ Supported by modern browsers

**Converting:**
Use shadcnthemer.com's built-in OKLCH picker, which auto-converts to HSL format for compatibility.

---

### Theme Application Workflow

```bash
# 1. Find or create theme on shadcnthemer.com
# 2. Copy exported CSS

# 3. Update globals.css
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Paste light theme variables here */
  }

  .dark {
    /* Paste dark theme variables here */
  }
}
EOF

# 4. Ensure dark mode is set up (next-themes)
npm install next-themes

# 5. Test the theme
npm run dev
```

---

### Advanced: Dynamic Theme Switching

```tsx
// lib/theme-config.ts
export const themes = {
  default: {
    light: {
      primary: '221.2 83.2% 53.3%',
      background: '0 0% 100%',
      // ... other variables
    },
    dark: {
      primary: '217.2 91.2% 59.8%',
      background: '222.2 84% 4.9%',
      // ... other variables
    },
  },
  ocean: {
    light: { /* Ocean theme light */ },
    dark: { /* Ocean theme dark */ },
  },
  forest: {
    light: { /* Forest theme light */ },
    dark: { /* Forest theme dark */ },
  },
};

// components/theme-switcher.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Select } from "@/components/ui/select";
import { themes } from "@/lib/theme-config";

export function ThemeSwitcher() {
  const { theme: mode } = useTheme(); // light or dark
  const [colorTheme, setColorTheme] = useState("default");

  useEffect(() => {
    const root = document.documentElement;
    const themeVars = themes[colorTheme][mode];

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [colorTheme, mode]);

  return (
    <Select value={colorTheme} onValueChange={setColorTheme}>
      <option value="default">Default</option>
      <option value="ocean">Ocean Blue</option>
      <option value="forest">Forest Green</option>
    </Select>
  );
}
```

---

### Tips for Great Themes

**Contrast:**
- ✅ Ensure 4.5:1 contrast ratio for body text
- ✅ Ensure 3:1 for large text
- ✅ Test with accessibility tools

**Consistency:**
- ✅ Use same hue family for related colors
- ✅ Maintain consistent saturation levels
- ✅ Keep lightness progression logical

**Testing:**
- ✅ Test in both light and dark modes
- ✅ Test with color blindness simulators
- ✅ Check on different displays

**Performance:**
- ✅ CSS variables are performant
- ✅ No JavaScript needed for static themes
- ✅ Instant theme switching with CSS classes

---

## Best Practices

### ✅ Do

- **Use composition** - Combine small components
- **Customize freely** - Edit components to fit your needs
- **Use Tailwind** - Leverage utility classes
- **Type everything** - Full TypeScript support
- **Follow accessibility** - Keep ARIA attributes
- **Use shadcn CLI** - Keep components updated

### ❌ Don't

- **Don't treat as npm package** - These are source files
- **Don't break accessibility** - Keep Radix UI patterns
- **Don't fight Tailwind** - Use utilities, not custom CSS
- **Don't skip types** - Maintain type safety

---

## Common Patterns

### Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[125px] w-full" />
      </CardContent>
    </Card>
  );
}
```

### Responsive Layout

```tsx
export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.id}>
          {/* Card content */}
        </Card>
      ))}
    </div>
  );
}
```

### Command Palette

```bash
npx shadcn@latest add command dialog
```

```tsx
import { Command } from "@/components/ui/command";

export function CommandPalette() {
  return (
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem>Calculator</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
```

---

## Integration with Backend

### API Client with React Query

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Fetch data
export function UserList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {users.map(user => (
        <Card key={user.id}>{user.name}</Card>
      ))}
    </div>
  );
}

// Create data
const createUser = useMutation({
  mutationFn: async (data: UserFormData) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create");
    return res.json();
  },
  onSuccess: () => {
    toast({ title: "User created successfully" });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
  onError: () => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to create user",
    });
  },
});
```

---

## Component Library

**Available Components:**

- Accordion
- Alert / Alert Dialog
- Avatar
- Badge
- Button
- Calendar
- Card
- Checkbox
- Command
- Dialog
- Dropdown Menu
- Form
- Input / Textarea
- Label
- Popover
- Radio Group
- Select
- Sheet
- Skeleton
- Slider
- Switch
- Table
- Tabs
- Toast
- Tooltip
- ... and more

**Icons:** Use `lucide-react`
```bash
npm install lucide-react
```

---

## Resources

- **Docs**: https://ui.shadcn.com
- **Components**: https://ui.shadcn.com/docs/components
- **Examples**: https://ui.shadcn.com/examples
- **Themes**: https://ui.shadcn.com/themes
- **CLI**: `npx shadcn@latest --help`

---

## Quick Reference

```bash
# Add component
npx shadcn@latest add [component-name]

# Add multiple
npx shadcn@latest add button card input form

# Update component
npx shadcn@latest add [component-name] --overwrite

# List available components
npx shadcn@latest add
```

**TypeScript + Tailwind + Radix UI = shadcn/ui** ✨
