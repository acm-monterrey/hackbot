import discord
import os
from dotenv import load_dotenv
from discord.ext import commands
import logging
import random

logging.basicConfig(level=logging.INFO)

load_dotenv()

intents = discord.Intents.default()
intents.members = True
intents.reactions = True
intents.messages = True
intents.emojis = True


class BotContext(commands.Context):
    async def tick(self, value):
        # reacts to the message with an emoji
        # depending on whether value is True or False
        # if its True, it'll add a green check mark
        # otherwise, it'll add a red cross mark
        emoji = '\N{WHITE HEAVY CHECK MARK}' if value else '\N{CROSS MARK}'
        try:
            # this will react to the command author's message
            await self.message.add_reaction(emoji)
        except discord.HTTPException:
            # sometimes errors occur during this, for example
            # maybe you dont have permission to do that
            # we dont mind, so we can just ignore them
            pass


class MyBot(commands.Bot):
    async def get_context(self, message, *, cls=BotContext):
        # when you override this method, you pass your new Context
        # subclass to the super() method, which tells the bot to
        # use the new MyContext class
        return await super().get_context(message, cls=cls)


bot = MyBot(command_prefix='-', intents=intents)


@bot.command()
async def guess(ctx, number: int):
    """ Guess a random number from 1 to 6. """
    # explained in a previous example, this gives you
    # a random number from 1-6
    value = random.randint(1, 6)
    # with your new helper function, you can add a
    # green check mark if the guess was correct,
    # or a red cross mark if it wasnt
    await ctx.tick(number == value)


@bot.event
async def on_ready():
    logging.info('We have logged in as {0.user}'.format(bot))


@bot.command()
async def ping(ctx):
    """Pong! Get the bot's response time"""
    em = discord.Embed(color=discord.Color.green())
    em.title = "Pong!"
    em.description = f'{bot.latency * 1000} ms'
    await ctx.send(embed=em)


"""MENTOR MANAGEMENT"""


@bot.group()
async def mentor_admin(ctx):
    """Command for managing users and their permissions"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the mentor command, no sub-command passed!')


@mentor_admin.command(name='assign')
async def _assign_mentor(ctx):
    """Assign permissions to a mentor directly from the Discord Interface"""
    await ctx.send('Mentor was assigned permissions.')


# Add skills

# Add mentors

# Remove mentors

# Go AFK

# No AFK

# Mentor associate company


"""USER MANAGEMENT"""


@bot.group()
async def user(ctx):
    """Command for managing users and their permissions"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the user command, no sub-command passed!')


@user.command(name='assign')
async def _assign_team(ctx):
    """Add new team directly from the Discord Interface"""
    await ctx.send('User was assigned to team')


"""TEAM MANAGEMENT"""


@bot.group()
async def team(ctx):
    """Command for managing teams"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the team command, no sub-command passed!')


@team.command(name='add')
async def _add_team(ctx):
    """Add new team directly from the Discord Interface"""

    # Team creation also creates a text and voice channel for the team, and subsequently assigns permissions ONLY to those team members and administrators

    await ctx.send('Team is being added')


@team.command(name='remove')
async def _remove_team(ctx):
    """Removes a team directly from the Discord Interface"""
    await ctx.send('Team is being removed')


"""MENTOR REQUEST BY PARTICIPANTS"""


@bot.group()
async def mentor(ctx):
    """Command group for interacting with mentors"""
    if ctx.invoked_subcommand is None:
        await ctx.send('Wrong invocation of the mentor command, no sub-command passed!')


@bot.command(pass_context=True)
async def embed(ctx):
    embed = discord.Embed(title="Mentors Board",
                          description="👍 Request Mentor\n"
                                      "👎🏻 Cancel Mentor Request\n"
                                      "👀 See Available Mentors\n",
                          color=0x8802F8)
    sent = await ctx.send(embed=embed)
    await sent.add_reaction(emoji='👍')
    await sent.add_reaction(emoji='👎🏻')
    await sent.add_reaction(emoji='👀')


@bot.event
async def on_raw_reaction_add(payload, ):
    channelID = 810379900418129950
    botID = 810303721657073685

    if channelID == payload.channel_id and payload.user_id != botID:
        if payload.emoji.name == '👍':
            pass
        elif payload.emoji.name == '👎🏻':
            pass
        elif payload.emoji.name == '👀':
            pass


@mentor.command(name='available')
async def _available_mentors(ctx):
    """Shows all available mentors and their skills"""
    pass
    # await ctx.send(f'Mentor {mentor_id} was requested by user {ctx.author.name}.')


@commands.has_role('Participante')
@mentor.command(name='request')
async def _request_mentor(ctx, mentor_id):
    """Request a mentor directly from the Discord Interface"""
    # Notify Mentor of request via DM (include team number in msg)
    # Add request to queue
    # Notify team if mentor is currently busy or offline

    await ctx.send(f'Mentor {mentor_id} was requested by user {ctx.author.name}.')


@commands.has_role('Participante')
@mentor.command(name='cancel')
async def _request_mentor(ctx):
    """Request a mentor directly from the Discord Interface"""
    await ctx.send(f'Request for mentor was canceled by user {ctx.author.name}.')


# Cancel request


@commands.has_role('mentor')
@mentor.command(name='attend', pass_context=True)
async def _attend_team(ctx, team_to_attend):
    """Mentor accepts team request and moves to voice channel automatically"""

    # Channel is created exclusively for this session
    # Team receives a message with the channel and gets assigned permissions for such

    guild = ctx.message.guild
    await guild.create_voice_channel('mentoring-session')
    # Block channel from all participants
    # Assign mentor and team to channel (so they can see it)
    # Block mentor from being marked as available until session is closed
    await ctx.send(f'Mentor {ctx.author.name} will attend team {team_to_attend}.')


@mentor.command(name='complete')
async def _complete_mentoring(ctx):
    """Mentor marks mentoring session as completed, cleanup of used resources is done"""
    # check if the channel exists
    guild = ctx.message.guild
    existing_channel = discord.utils.get(guild.channels, name='mentoring-session')

    # if the channel exists
    if existing_channel is not None:
        await existing_channel.delete()
    # if the channel does not exist, inform the user
    else:
        await ctx.send('No channel named, "mentoring-session", was found')
    # await ctx.send('Resources cleaned up!')


"""
ERROR HANDLING
"""


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.errors.CheckFailure):
        await ctx.send('You do not have the correct role for this command.')


bot.run(os.getenv('TOKEN'))