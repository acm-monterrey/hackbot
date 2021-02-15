from discord.ext import commands
from discord.ext import tasks
import asyncio
import discord
import json
import datetime


class RegistrationSystem(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def handle_team_confirmation_webhook(self):
        pass

    async def create_non_existing_team_role(self):
        pass

    async def get_number_of_teams(self):
        """Used when assigning channels to a recently confirmed team"""
        pass

    async def assign_participant_badge(self):
        """Assigns the badge that corresponds to the team after it's creation"""
        pass

    async def create_team_voice_channels(self):
        """Creates voice channel with current team number"""
        pass

    async def assign_team_permissions(self):
        """Assigns team permissions to the created voice channels"""
        pass
