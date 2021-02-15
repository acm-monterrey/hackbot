from discord.ext import commands
from discord.ext import tasks
import asyncio
import discord
import json
import datetime
import logging


class MentorManagement(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    # TODO Create Mentoring Session Records

    # TODO Instead of creating a new channel for the mentoring session, authorize the mentor to enter the teams
    #  channel for the duration of the session, then just remove the mentor when done. This allows for a more elegant
    #  solution, that won't create an incredibly big load of voice channels. Plus, this will only require the mentor
    #  to move channels, and not the whole team.

    @commands.group()
    async def mentor(self, ctx):
        """Command group for interacting with mentors"""
        if ctx.invoked_subcommand is None:
            await ctx.send('Wrong invocation of the mentor command, no sub-command passed!')

    @mentor.command(name="request")
    async def create_mentoring_session_request(self, ctx,
                                               channel: discord.TextChannel = None):  # Set up channel for notifications here????
        if channel is None:
            channel = ctx.message.channel

        mentoring_request_embed = discord.Embed(title="Create A Mentoring Request",
                                                description="To create a request react with 📩",
                                                timestamp=ctx.message.created_at, color=discord.colour.Colour.green())
        mentoring_request_embed.set_footer(text=f"HackMTY - HackBot")

        create_ticket_msg = await channel.send(embed=mentoring_request_embed)
        await create_ticket_msg.add_reaction("📩")

        await ctx.message.delete()

        # create_ticket_msgs_dict = await self.read_json_to_dict("create_ticket_msgs_ids.json", ctx.channel)

        # create_ticket_msgs_dict[str(create_ticket_msg.id)] = ctx.guild.id

        # with open("json/create_ticket_msgs_ids.json", "w") as create_ticket_msgs_json_file:
        #    json.dump(create_ticket_msgs_dict, create_ticket_msgs_json_file)

    @mentor.command(name="complete")
    async def complete_mentoring_session(self, ctx, channel: discord.TextChannel = None):
        if channel is None:
            channel = ctx.channel

        await self.close_mentoring_request(ctx.channel, ctx.author, ctx.guild, channel)

    async def close_mentoring_request(self, channel, author, guild, mentoring_channel: discord.TextChannel = None):
        if mentoring_channel is None:
            mentoring_channel = channel

        confirm_closure_embed = discord.Embed(
            description=f"Please confirm that mentoring session {mentoring_channel.mention} is done\n React with ✅ to close and ❎ to keep the session open",
            timestamp=datetime.datetime.now(), colour=discord.colour.Colour.red())
        confirm_closure_embed.set_footer(text=f"HackMTY - HackBot")
        confirm_closure_message = await channel.send(embed=confirm_closure_embed)
        await confirm_closure_message.add_reaction("✅")
        await confirm_closure_message.add_reaction("❎")

        # Sanity Check
        def mentoring_session_sanity_check(mentoring_session_closure_reaction, mentoring_session_closure_user):
            return mentoring_session_closure_user == author and str(mentoring_session_closure_reaction.emoji) in {"✅",
                                                                                                                  "❎"}

        try:
            mentoring_session_closure_reaction, mentoring_session_closure_user = await self.bot.wait_for("reaction_add",
                                                                                                         timeout=60.0,
                                                                                                         check=mentoring_session_sanity_check)
        except asyncio.TimeoutError:
            logging.error("Embed Reaction Timeout when trying to close mentoring request")
            return
        else:
            if str(mentoring_session_closure_reaction.emoji) == "❎":
                # Session closure was cancelled
                return
            if str(mentoring_session_closure_reaction.emoji) == "✅":
                # TODO Unassign voice channel permissions for mentor
                # TODO Delete Mentoring Channel (NVM)
                # TODO Log Mentoring Session Metadata
                # TODO Delete Associated Messages (cleanup)
                pass

    @commands.Cog.listener()
    async def on_reaction_add(self, reaction, user):
        create_ticket_msg = reaction.message

        checked_create_ticket_reaction = await self.check_create_ticket_reaction(reaction, user)

        checked_ticket_lock_reaction = await self.check_ticket_lock_reaction(reaction, user)

        if checked_ticket_lock_reaction:
            await self.close_ticket(reaction.message.channel, user, reaction.message.guild, reaction.message.channel)

        if checked_create_ticket_reaction:
            confirm_embed_message = discord.Embed(
                description="Please confirm your ticket creation with ✅ (for yes) and ❎ (for no)",
                color=discord.colour.Colour.green())
            confirm_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf",
                                             icon_url="https://i.imgur.com/MRBsIpe.png")

            await create_ticket_msg.add_reaction("✅")
            await create_ticket_msg.add_reaction("❎")

            confirm_creation_msg = await create_ticket_msg.channel.send(embed=confirm_embed_message)

            def ticket_creation_check(ticket_creation_reaction, ticket_creation_user):
                return ticket_creation_user == user and str(ticket_creation_reaction.emoji) in {"✅", "❎"}

            try:
                ticket_creation_reaction, ticket_creation_user = await self.bot.wait_for("reaction_add", timeout=60.0,
                                                                                         check=ticket_creation_check)
            except asyncio.TimeoutError:
                for reaction in ["📩", "✅", "❎"]:
                    await create_ticket_msg.remove_reaction(reaction, user)

                for reaction in ["✅", "❎"]:
                    await create_ticket_msg.remove_reaction(reaction, self.bot.user)

                await confirm_creation_msg.delete()
            else:
                await confirm_creation_msg.delete()

                if str(ticket_creation_reaction.emoji) == "❎":
                    for reaction in ["📩", "✅", "❎"]:
                        await create_ticket_msg.remove_reaction(reaction, user)

                    for reaction in ["✅", "❎"]:
                        await create_ticket_msg.remove_reaction(reaction, self.bot.user)

                if str(ticket_creation_reaction.emoji) == "✅":
                    for reaction in ["📩", "✅", "❎"]:
                        await create_ticket_msg.remove_reaction(reaction, user)

                    for reaction in ["✅", "❎"]:
                        await create_ticket_msg.remove_reaction(reaction, self.bot.user)

                    current_ticket_number = await self.get_ticket_counter(create_ticket_msg)
                    guild_ticket_category = await self.get_guild_ticket_catergory(create_ticket_msg)
                    guild_support_role = await self.get_guild_support_roles(create_ticket_msg)

                    ticket_channel_overwrites = {
                        guild_support_role: discord.PermissionOverwrite(read_messages=True),
                        user: discord.PermissionOverwrite(read_messages=True),
                        create_ticket_msg.guild.default_role: discord.PermissionOverwrite(read_messages=False)
                    }

                    current_ticket_number += 1

                    users_ticket_channel = await guild_ticket_category.create_text_channel(
                        f"ticket-{current_ticket_number}", overwrites=ticket_channel_overwrites)

                    await self.write_ticket_counter_to_json(create_ticket_msg, current_ticket_number)

                    await self.write_ticket_id_to_user_id(users_ticket_channel, user)

                    ticket_embed_message = discord.Embed(
                        description=f"Support will be with you shortly.\nTo close this ticket react with 🔒",
                        color=discord.colour.Colour.green())
                    ticket_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf",
                                                    icon_url="https://i.imgur.com/MRBsIpe.png")

                    await users_ticket_channel.send(f"{user.mention} {guild_support_role.mention}")
                    users_ticket_channel_embed = await users_ticket_channel.send(embed=ticket_embed_message)
                    await users_ticket_channel_embed.add_reaction("🔒")

                    await self.write_lock_msg_id_to_json(users_ticket_channel_embed)









def setup(bot):
    bot.add_cog(MentorManagement(bot))
