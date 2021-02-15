from discord.ext import commands
from discord.ext import tasks
import asyncio
import discord
import json
import datetime

class TicketSystem(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    async def read_json_to_dict(self, json_file_name, channel):
        json_dict = {}

        try:
            with open(f"json/{json_file_name}", "r") as json_file:
                json_dict = json.load(json_file)
        except:
            embed_message = discord.Embed(title="Error: JSON", description="Please create a support ticket in the Nexus Developments Discord to get this resolved - https://discord.gg/YmdugDf",colour=discord.colour.Colour.red())
            embed_message.set_footer(text="Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

            await channel.send(embed=embed_message)

        return json_dict

    async def check_create_ticket_reaction(self, reaction, user):
        create_ticket_msgs_dict = await self.read_json_to_dict("create_ticket_msgs_ids.json", reaction.message.channel)

        if str(reaction.message.id) in create_ticket_msgs_dict.keys():
            if str(reaction.emoji) == "📩":
                if user != self.bot.user:
                    return True

    async def check_ticket_lock_reaction(self, reaction, user):
        lock_ticket_message_dict = await self.read_json_to_dict("lock_ticket_msg_id.json", reaction.message.channel)

        if str(reaction.message.id) in lock_ticket_message_dict.keys():
            if user != self.bot.user:
                return True

    async def get_ticket_counter(self, message):
        ticket_counter_dict = await self.read_json_to_dict("ticket_counter.json", message.channel)

        current_ticket_number = ticket_counter_dict.get(str(message.guild.id))

        if current_ticket_number is None:
            current_ticket_number = 0

        return current_ticket_number

    async def get_guild_ticket_catergory(self, message):
        ticket_categories_dict = await self.read_json_to_dict("ticket_categories_ids.json", message.channel)

        guild_ticket_category_id = ticket_categories_dict.get(str(message.guild.id))

        guild_ticket_category = discord.utils.get(message.guild.categories, id=guild_ticket_category_id)

        if guild_ticket_category is None:
            embed_message = discord.Embed(title="Error: TicketCategoryNotFound", description="Please create a support ticket in the Nexus Developments Discord to get this resolved - https://discord.gg/YmdugDf", colour=discord.colour.Colour.red())
            embed_message.set_footer(text="Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

            await message.channel.send(embed=embed_message)
        else:
            return guild_ticket_category

    async def get_guild_support_roles(self, message):
        support_roles_dict = await self.read_json_to_dict("support_roles_ids.json", message.channel)

        guild_support_role_id = support_roles_dict.get(str(message.guild.id))

        guild_support_role = discord.utils.get(message.guild.roles, id=guild_support_role_id)

        if guild_support_role is None:
            embed_message = discord.Embed(title="Error: SupportRolesNotFound", description="Please create a support ticket in the Nexus Developments Discord to get this resloved - https://discord.gg/YmdugDf", colour=discord.colour.Colour.red())
            embed_message.set_footer(text="Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

            await message.channel.send(embed=embed_message)
        else:
            return guild_support_role

    async def write_ticket_counter_to_json(self, message, current_ticket_number):
        ticket_counter_dict = await self.read_json_to_dict("ticket_counter.json", message.channel)

        ticket_counter_dict[str(message.guild.id)] = current_ticket_number

        with open("json/ticket_counter.json", "w") as ticket_counter_json:
            json.dump(ticket_counter_dict, ticket_counter_json)

    async def create_ticket_transcript(self, ticket_channel: discord.TextChannel):
        ticket_channel_messages = await ticket_channel.history(oldest_first=True).flatten()

        transcript_path = f"transcripts/{datetime.date.today()}_{ticket_channel.name}_Transcript.txt"

        with open(transcript_path, "w+") as ticket_transcript:
            for ticket_channel_message in ticket_channel_messages:
                ticket_transcript.write(f"{ticket_channel_message.created_at} - {ticket_channel_message.author.name}#{ticket_channel_message.author.discriminator} - {ticket_channel_message.content}\n")

        return transcript_path

    async def write_ticket_id_to_user_id(self, ticket_channel, user):
        ticket_creator_dict = await self.read_json_to_dict("ticket_creator_ids.json", ticket_channel)

        ticket_creator_dict[str(ticket_channel.id)] = user.id

        with open("json/ticket_creator_ids.json", "w") as ticket_creator_json:
            json.dump(ticket_creator_dict, ticket_creator_json)

    async def write_lock_msg_id_to_json(self, message):
        lock_message_id_dict = await self.read_json_to_dict("lock_ticket_msg_id.json", message.channel)

        lock_message_id_dict[str(message.id)] = message.channel.id

        with open("json/lock_ticket_msg_id.json", "w") as lock_message_json_file:
            json.dump(lock_message_id_dict, lock_message_json_file)

    @commands.Cog.listener()
    async def on_reaction_add(self, reaction, user):
        create_ticket_msg = reaction.message

        checked_create_ticket_reaction = await self.check_create_ticket_reaction(reaction, user)

        checked_ticket_lock_reaction = await self.check_ticket_lock_reaction(reaction, user)

        if checked_ticket_lock_reaction:
            await self.close_ticket(reaction.message.channel, user, reaction.message.guild, reaction.message.channel)

        if checked_create_ticket_reaction:
            confirm_embed_message = discord.Embed(description="Please confirm your ticket creation with ✅ (for yes) and ❎ (for no)", color=discord.colour.Colour.green())
            confirm_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

            await create_ticket_msg.add_reaction("✅")
            await create_ticket_msg.add_reaction("❎")

            confirm_creation_msg = await create_ticket_msg.channel.send(embed=confirm_embed_message)

            def ticket_creation_check(ticket_creation_reaction, ticket_creation_user):
                return ticket_creation_user == user and str(ticket_creation_reaction.emoji) in {"✅", "❎"}

            try:
                ticket_creation_reaction, ticket_creation_user = await self.bot.wait_for("reaction_add", timeout=60.0, check=ticket_creation_check)
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

                    users_ticket_channel = await guild_ticket_category.create_text_channel(f"ticket-{current_ticket_number}", overwrites=ticket_channel_overwrites)

                    await self.write_ticket_counter_to_json(create_ticket_msg, current_ticket_number)

                    await self.write_ticket_id_to_user_id(users_ticket_channel, user)

                    ticket_embed_message = discord.Embed(description=f"Support will be with you shortly.\nTo close this ticket react with 🔒", color=discord.colour.Colour.green())
                    ticket_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

                    await users_ticket_channel.send(f"{user.mention} {guild_support_role.mention}")
                    users_ticket_channel_embed = await users_ticket_channel.send(embed=ticket_embed_message)
                    await users_ticket_channel_embed.add_reaction("🔒")

                    await self.write_lock_msg_id_to_json(users_ticket_channel_embed)

    async def close_ticket(self, channel, author, guild, ticket_channel: discord.TextChannel = None):
        if ticket_channel is None:
            ticket_channel = channel

        confirm_closure_embed_message = discord.Embed(description=f"Please confirm the closure of {ticket_channel.mention}\n React with ✅ to close and ❎ to keep the ticket open", timestamp=datetime.datetime.now(), colour=discord.colour.Colour.red())
        confirm_closure_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

        confirm_closure_message = await channel.send(embed=confirm_closure_embed_message)
        await confirm_closure_message.add_reaction("✅")
        await confirm_closure_message.add_reaction("❎")

        def ticket_creation_check(ticket_closure_reaction, ticket_closure_user):
            return ticket_closure_user == author and str(ticket_closure_reaction.emoji) in {"✅", "❎"}

        try:
            ticket_closure_reaction, ticket_closure_user = await self.bot.wait_for("reaction_add", timeout=60.0, check=ticket_creation_check)
        except asyncio.TimeoutError:
            return
        else:
            if str(ticket_closure_reaction.emoji) == "❎":
                return

            if str(ticket_closure_reaction.emoji) == "✅":
                ticket_creator_dict = await self.read_json_to_dict("ticket_creator_ids.json", channel)
                ticket_creator_user_id = ticket_creator_dict.get(str(ticket_channel.id))
                ticket_creator_user = discord.utils.get(guild.members, id=ticket_creator_user_id)

                await ticket_channel.set_permissions(ticket_creator_user, send_messages=False, add_reactions=True, read_messages=True)

                transcript_status_embed_message = discord.Embed(description="Creating Transcript...", timestamp=datetime.datetime.now(), colour=discord.colour.Colour.orange())
                transcript_status_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

                transcript_status_message = await channel.send(embed=transcript_status_embed_message)

                transcript_path = await self.create_ticket_transcript(ticket_channel)

                transcript_dm_user = await self.bot.fetch_user(223200232232452096)

                transcript_status_embed_message = discord.Embed(description=f"Created Transcript. Sending transcript to {transcript_dm_user.name}#{transcript_dm_user.discriminator}", timestamp=datetime.datetime.now(), colour=discord.colour.Colour.green())
                transcript_status_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

                await transcript_status_message.edit(embed=transcript_status_embed_message)

                if transcript_dm_user.dm_channel is None:
                    await transcript_dm_user.create_dm()

                transcript_file = discord.File(transcript_path)

                transcript_dm_embed_message = discord.Embed(title=f"Support Ticket Transcript: {ticket_channel.name}", timestamp=datetime.datetime.now(), colour=discord.colour.Colour.green())
                transcript_dm_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

                await transcript_dm_user.dm_channel.send(embed=transcript_dm_embed_message, file=transcript_file)

                ticket_closure_embed_message = discord.Embed(description=f"Ticket has been closed by {author.name}#{author.discriminator}", timestamp=datetime.datetime.now(), colour=discord.colour.Colour.green())
                ticket_closure_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

                await ticket_channel.send(embed=ticket_closure_embed_message)

                ticket_closure_option_embed_message = discord.Embed(description="Reopen Ticket: 🔓\nDelete Ticket: ⛔", timestamp=datetime.datetime.now(), colour=discord.colour.Colour.red())
                ticket_closure_option_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

                ticket_closure_options_message = await ticket_channel.send(embed=ticket_closure_option_embed_message)
                await ticket_closure_options_message.add_reaction("🔓")
                await ticket_closure_options_message.add_reaction("⛔")

                def ticket_options_check(ticket_options_reaction, ticket_options_user):
                    return ticket_options_user != self.bot.user and str(ticket_options_reaction.emoji) in {"🔓", "⛔"}

                try:
                    ticket_options_reaction, ticket_options_user = await self.bot.wait_for("reaction_add", timeout=3600.0, check=ticket_options_check)
                except asyncio.TimeoutError:
                    return
                else:
                    if str(ticket_options_reaction.emoji) == "⛔":
                        await ticket_channel.delete()

                    if str(ticket_options_reaction.emoji) == "🔓":
                        await ticket_channel.set_permissions(ticket_creator_user, send_messages=None, add_reactions=None, read_messages=True)

                        reopened_ticket_embed_message = discord.Embed(description=f"Ticket has been reopened by {ticket_options_user.name}#{ticket_options_user.discriminator}", timestamp=datetime.datetime.now(), colour=discord.colour.Colour.green())
                        reopened_ticket_embed_message.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

                        await ticket_channel.send(embed=reopened_ticket_embed_message)

    @commands.command(name="ticketmsg")
    async def send_create_ticket_msg(self, ctx, channel: discord.TextChannel = None):
        if channel is None:
            channel = ctx.message.channel

        embedMessage = discord.Embed(title="Create A Ticket", description="To create a ticket react with 📩", timestamp=ctx.message.created_at, color=discord.colour.Colour.green())
        embedMessage.set_footer(text=f"Created By Nexus Developments - https://discord.gg/YmdugDf", icon_url="https://i.imgur.com/MRBsIpe.png")

        create_ticket_msg = await channel.send(embed=embedMessage)
        await create_ticket_msg.add_reaction("📩")

        await ctx.message.delete()

        create_ticket_msgs_dict = await self.read_json_to_dict("create_ticket_msgs_ids.json", ctx.channel)

        create_ticket_msgs_dict[str(create_ticket_msg.id)] = ctx.guild.id

        with open("json/create_ticket_msgs_ids.json", "w") as create_ticket_msgs_json_file:
            json.dump(create_ticket_msgs_dict, create_ticket_msgs_json_file)

    @commands.command(name="close")
    async def close_ticket_command(self, ctx, channel: discord.TextChannel = None):
        if channel is None:
            channel = ctx.channel

        await self.close_ticket(ctx.channel, ctx.author, ctx.guild, channel)

def setup(bot):
    bot.add_cog(TicketSystem(bot))