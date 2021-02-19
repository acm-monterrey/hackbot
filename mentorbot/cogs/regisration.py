from discord.ext import commands
from discord.ext import tasks
import asyncio
import discord
import json
import datetime


class RegistrationSystem(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def handle_team_confirmation_via_webhook(self):
        pass

    async def create_non_existing_team_role(self):
        """Called when new team confirmation is received and the team does not exist"""
        pass

    async def get_number_of_teams(self):
        """Used when assigning channels to a recently confirmed team"""
        pass

    async def assign_participant_badge(self):
        """Assigns the badge that corresponds to the team after it's creation"""
        pass

    async def assign_inactive_badge(self):
        """Assign this badge if team is incomplete (members != 4)"""
        pass

    async def check_if_team_is_complete(self) -> True:
        """When team is full, this function returns True"""
        pass

    async def remove_inactive_badge(self):
        pass

    async def create_team_voice_channels(self):
        """Creates voice channel with current team number"""

        pass

    async def assign_team_permissions(self):
        """Assigns team permissions to the created voice channels"""
        pass

    @commands.command(name="assign-to-team")
    async def override_team_assignment(self, team_number, member_to_assign):
        # This needs to be done PER team member
        pass

    @commands.command(name="remove-team")
    async def remove_team(self, team_number):
        # TODO ASK FOR CONFIRMATION BEFORE DOING OPERATION (embed w/emojis)
        pass

    @commands.command(name="remove-participant")
    async def remove_participant(self):
        # TODO ASK FOR CONFIRMATION BEFORE DOING OPERATION (embed w/emojis)
        pass

    @commands.command(name="ban-participant")
    async def ban_participant(self):
        # TODO ASK FOR CONFIRMATION BEFORE DOING OPERATION (embed w/emojis)
        pass


