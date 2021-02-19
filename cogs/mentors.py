from discord.ext import commands
from discord.ext import tasks
import asyncio
import discord
import json
import datetime
import logging
from config import connect_to_mongo

db = connect_to_mongo()
db = db.hackbot


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
    async def create_mentoring_session_request(self, ctx,  # member: discord.Member
                                               channel: discord.TextChannel = None):  # Set up channel for notifications here????
        if channel is None:
            channel = ctx.message.channel

        mentoring_request_embed = discord.Embed(title="Create A Mentoring Request",
                                                description="To create a request react with 📩",
                                                timestamp=ctx.message.created_at, color=discord.colour.Colour.green())
        mentoring_request_embed.set_footer(text=f"HackMTY - HackBot")

        create_ticket_msg = await channel.send(embed=mentoring_request_embed)
        await create_ticket_msg.add_reaction("📩")

        await ctx.message.delete()  # Deletes original request message (aka command used)

        # Adds the mentoring request to the queue

        # If emoji matches the request confirmation, give mentor channel permissions so that he can join it
        # mark mentor as unavailable
        # log the mentoring session
        # watch for complete command, if confirmed, log the session and close it
        # remove the permissions from the mentor
        # mark mentor as available

        # mentor_role_of_team_being_attended = discord.utils.get(ctx.guild.roles, name='Muted') # Team name goes instead of muted
        # await member.add_roles(mentor_role_of_team_being_attended)
        # await ctx.send("Mentor was assigned X team permissions")

        # create_mentoring_msgs_dict = await self.read_json_to_dict("create_mentoring_msgs_ids.json", ctx.channel)

        # create_mentoring_msgs_dict[str(create_ticket_msg.id)] = ctx.guild.id

        # with open("json/create_mentoring_msgs_ids.json", "w") as create_ticket_msgs_json_file:
        #    json.dump(create_mentoring_msgs_dict, create_ticket_msgs_json_file)

    @commands.has_role('mentor')
    @mentor.command(name="attend")
    async def attend_team_that_needs_mentoring(self, ctx, team_to_attend):
        # server_members = ctx.guild.members

        # Need to check if that team is actually in the queue, and remove them from it afterwards
        ctx.author.add_role('Team ' + team_to_attend)

        ctx.send('You are able to join the teams voice channel!')
        await asyncio.sleep(10)
        await ctx.message.delete()

    # TODO COMPLETE
    @commands.has_role('mentor')
    @mentor.command(name="queue")
    async def show_team_mentoring_queue(self, ctx):
        pass

    # TODO COMPLETE
    @commands.has_role('Participant')
    @mentor.command(name="available")
    async def show_available_mentors(self, ctx):
        pass

    # TODO COMPLETE
    @commands.has_role('mentor')
    @mentor.command(name="complete")
    async def complete_mentoring_session(self, ctx, team_attending, channel: discord.TextChannel = None):
        if channel is None:
            channel = ctx.channel

        await self.close_mentoring_request(ctx, ctx.channel, ctx.author, ctx.guild, team_attending, channel)

    async def close_mentoring_request(self, ctx, channel, author, guild, team_attending,
                                      mentoring_channel: discord.TextChannel = None):
        if mentoring_channel is None:
            mentoring_channel = channel

        confirm_closure_embed = discord.Embed(
            description=f"Please confirm that mentoring session with team {mentoring_channel.mention} is done\n React with ✅ to close and ❎ to keep the session open",
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
                ctx.author.remove_role('Team ' + team_attending)

                ctx.send('You are able to join the teams voice channel!')
                await asyncio.sleep(10)
                await ctx.message.delete()

                # TODO Unassign voice channel permissions for mentor
                # TODO Delete Mentoring Channel (NVM)
                # TODO Log Mentoring Session Metadata
                # TODO Delete Associated Messages (cleanup)
                pass

    @commands.Cog.listener()
    async def on_reaction_add(self, reaction, user):
        reacted_message = reaction.message

        checked_create_ticket_reaction = await self.check_create_ticket_reaction(reaction, user)

        checked_ticket_lock_reaction = await self.check_ticket_lock_reaction(reaction, user)

        if checked_ticket_lock_reaction:
            await self.close_ticket(reaction.message.channel, user, reaction.message.guild, reaction.message.channel)

        if checked_create_ticket_reaction:
            confirm_embed_message = discord.Embed(
                description="Please confirm your ticket creation with ✅ (for yes) and ❎ (for no)",
                color=discord.colour.Colour.green())
            confirm_embed_message.set_footer(text=f"HackMTY - HackBot")

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
                    ticket_embed_message.set_footer(text=f"HackMTY - HackBot")

                    await users_ticket_channel.send(f"{user.mention} {guild_support_role.mention}")
                    users_ticket_channel_embed = await users_ticket_channel.send(embed=ticket_embed_message)
                    await users_ticket_channel_embed.add_reaction("🔒")

                    await self.write_lock_msg_id_to_json(users_ticket_channel_embed)

    """
    # TODO INSPECT
    async def read_json_to_dict(self, json_file_name, channel):
        json_dict = {}

        try:
            with open(f"json/{json_file_name}", "r") as json_file:
                json_dict = json.load(json_file)
        except:
            embed_message = discord.Embed(title="Error: JSON",
                                          description="Please create a support ticket",
                                          colour=discord.colour.Colour.red())

            await channel.send(embed=embed_message)

        return json_dict
    """

    # TODO INSPECT
    async def check_create_ticket_reaction(self, reaction, user):
        create_ticket_msgs_dict = await self.read_json_to_dict("create_mentoring_msgs_ids.json",
                                                               reaction.message.channel)

        if str(reaction.message.id) in create_ticket_msgs_dict.keys():
            if str(reaction.emoji) == "📩":
                if user != self.bot.user:
                    return True

    # TODO INSPECT
    async def check_ticket_lock_reaction(self, reaction, user):
        lock_ticket_message_dict = await self.read_json_to_dict("lock_mentoring_msg_id.json", reaction.message.channel)

        if str(reaction.message.id) in lock_ticket_message_dict.keys():
            if user != self.bot.user:
                return True



    # TODO INSPECT
    """
    async def get_guild_ticket_catergory(self, message):
        ticket_categories_dict = await self.read_json_to_dict("mentoring_categories_ids.json", message.channel)

        guild_ticket_category_id = ticket_categories_dict.get(str(message.guild.id))

        guild_ticket_category = discord.utils.get(message.guild.categories, id=guild_ticket_category_id)

        if guild_ticket_category is None:
            embed_message = discord.Embed(title="Error: TicketCategoryNotFound",
                                          description="Please create a support ticket",
                                          colour=discord.colour.Colour.red())

            await message.channel.send(embed=embed_message)
        else:
            return guild_ticket_category

    # TODO INSPECT
    async def get_guild_support_roles(self, message):
        support_roles_dict = await self.read_json_to_dict("support_roles_ids.json", message.channel)

        guild_support_role_id = support_roles_dict.get(str(message.guild.id))

        guild_support_role = discord.utils.get(message.guild.roles, id=guild_support_role_id)

        if guild_support_role is None:
            embed_message = discord.Embed(title="Error: SupportRolesNotFound",
                                          description="Please create a support ticket",
                                          colour=discord.colour.Colour.red())

            await message.channel.send(embed=embed_message)
        else:
            return guild_support_role
"""

    # TODO INSPECT - made equivalent barebone
    async def write_ticket_counter_to_json(self, message, current_ticket_number):
        ticket_counter_dict = await self.read_json_to_dict("mentoring_counter.json", message.channel)

        ticket_counter_dict[str(message.guild.id)] = current_ticket_number

        with open("json/mentoring_counter.json", "w") as ticket_counter_json:
            json.dump(ticket_counter_dict, ticket_counter_json)

    # TODO INSPECT
    async def create_ticket_transcript(self, ticket_channel: discord.TextChannel):
        ticket_channel_messages = await ticket_channel.history(oldest_first=True).flatten()

        transcript_path = f"transcripts/{datetime.date.today()}_{ticket_channel.name}_Transcript.txt"

        with open(transcript_path, "w+") as ticket_transcript:
            for ticket_channel_message in ticket_channel_messages:
                ticket_transcript.write(
                    f"{ticket_channel_message.created_at} - {ticket_channel_message.author.name}#{ticket_channel_message.author.discriminator} - {ticket_channel_message.content}\n")

        return transcript_path

    # TODO INSPECT - Made equivalente barebone
    async def write_ticket_id_to_user_id(self, ticket_channel, user):
        ticket_creator_dict = await self.read_json_to_dict("mentoring_creator_ids.json", ticket_channel)

        ticket_creator_dict[str(ticket_channel.id)] = user.id

        with open("json/mentoring_creator_ids.json", "w") as ticket_creator_json:
            json.dump(ticket_creator_dict, ticket_creator_json)

    # TODO INSPECT
    async def write_lock_msg_id_to_json(self, message):
        lock_message_id_dict = await self.read_json_to_dict("lock_mentoring_msg_id.json", message.channel)

        lock_message_id_dict[str(message.id)] = message.channel.id

        with open("json/lock_mentoring_msg_id.json", "w") as lock_message_json_file:
            json.dump(lock_message_id_dict, lock_message_json_file)

    async def save_mentoring_session_count_on_db(self, message):
        """
        Returns the number of mentoring sessions in the current guild.
        :param message: Message in question (contains guild number)
        :return: number of current and past mentoring sessions
        """
        col = db.mentoring_count
        result = col.find_one({'_id': str(message.guild.id)})
        return result["mentoring_sessions_count"]

    async def update_mentoring_session_count_on_db(self, message):
        col = db.mentoring.count
        col.update_one({'_id': str(message.guild.id)}, {'$inc': {'mentoring_sessions_count': 1}})


    async def link_mentoring_id_to_team_id_on_db(self, mentoring_id, team_id):
        pass


def setup(bot):
    bot.add_cog(MentorManagement(bot))
