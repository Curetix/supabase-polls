# Supabase Polls

Simple app to create and vote on polls.
Built with React, Chakra UI and Supabase ❤️ during the [Launch Week 5 Hackathon](https://supabase.com/blog/launch-week-5-hackathon).

This is my first React project (I'm used to Vue), so it will be messy in places.

## Features

* Create a poll with up to five choices, optionally allow multiple-choice votes.
* Results page with visualizations and realtime updates.

## Planned Features

* Add autentication, so users can manage their polls.
* Bot-protections using Captcha, an IP record table and user sessions.
* Dunno, maybe more.

## Supabase Technologies

* Polls and votes stored in Database
* Edge Functions to create polls and cast votes
* Database Functions to count votes for a poll, so a client doesn't have to request all individual votes
* Realtime votes and poll results page
