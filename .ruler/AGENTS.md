# Globber Project - AI Agent Instructions

## Overview
This directory contains centralized AI agent instructions for the **Globber** project - a 3D globe-based travel visualization application built with React 19 and Next.js 15.

## Purpose
Ruler concatenates all .md files in this directory (and subdirectories), starting with AGENTS.md (if present), then remaining files in sorted order. This ensures consistent behavior across all AI coding assistants (Claude Code, GitHub Copilot, Cursor, etc.).

## Quick Reference
- **Framework**: Next.js 15.5.2, React 19.1.0, TypeScript (strict mode)
- **Package Manager**: pnpm
- **Linting**: Biome (no ESLint/Prettier)
- **Styling**: TailwindCSS v4, CVA
- **State**: Zustand, TanStack React Query
- **3D Graphics**: Globe.gl, React-Globe.gl, Three.js

## Project-Specific Rules
See `GLOBBER.md` for detailed project instructions including:
- Environment variable patterns (CRITICAL)
- Code quality standards (NO console.log, NO TODO comments)
- Component patterns (dynamic imports, forwardRef)
- File organization structure
- Known technical debt and improvement priorities
